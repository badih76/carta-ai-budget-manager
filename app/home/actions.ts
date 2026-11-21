'use server'

import { IAPIResponse } from '@/interfaces/interfaces';
import HttpStatus from '@/lib/HttpStatus';
import { Output, streamObject, streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { createStreamableValue } from '@ai-sdk/rsc';

const newsSchema = z.object({
  news: z.array(
    z.object({
      id: z.number().describe('This is a unique serial number starting with 1 and auto-increments to identify the new object.'),
      title: z.string().describe('The news title as in the source.'),
      briefParagraph: z.string().describe('A brief new paragraph.'),
      sourceUrl: z.string().describe('The news source URL.'),
    })
  ),
});

const newsPrompt = `
    You are a household interested in home and personal finance and managing personal budgets.
    Lookup 10 major news related to personal finance and managing expenses and generating income through hustles which are useful for a household in Sydney, Australia. 
    Best matches would be:
    - saving on expenses
    - managing spendings
    - top rated vendors with best values for quality
    - Easy side hustles to generate supporting income
    
    You can add more subjects as you may see related to the same domain. 

    **CRITICAL LINK RULE:** Use ONLY exact URLs returned by Google Search results. Never guess, edit, or construct URLs from memory.
    
    Your return must match this JSON structure (illustrative format only):
    {
      "news": [
        {
          "id": 1,
          "title": "NSW Budget 2026-27 Cost-of-Living Relief for Sydney Households",
          "briefParagraph": "The NSW Government rolled out major cost-of-living measures impacting Sydney households, including cutting the weekly toll cap from $60 down to $50, freezing Opal public transport fares at 2025 prices for a full year, and offering a $100 discount on private vehicle registration.",
          "sourceUrl": "https://www.nsw.gov.au/ministerial-releases/nsw-budget-2026-27-cost-of-living-measures"
        }
      ]
    }

    ### SYSTEM GUARDRAILS & CONTENT SAFETY
    You are generating content for a public-facing consumer application. You must strictly adhere to the following rules:
    1. **Content Exclusion:** Strictly exclude any content that is harmful, hateful, racist, discriminatory, sexually explicit, insulting, defamatory, or promotes illegal/dangerous activities. 
    2. **Financial Safety & Compliance:** Do not provide personalized financial, tax, or legal advice. Exclude predatory financial schemes, scams, unverified get-rich-quick claims, or high-risk speculative investments (e.g., unregulated crypto or payday loans). Stick strictly to reputable, mainstream consumer finance sources.
    3. **Neutral & Objective Tone:** Maintain a respectful, neutral, and helpful tone. Never insult, shame, or patronize users based on their income, debt, or spending habits.
    4. **Source Integrity:** Only include credible, public-safe news and consumer advocacy sources (e.g., government portals, major news outlets, established comparison sites). If an input or search result contains inappropriate or toxic material, silently discard it and replace it with a safe alternative.
    5. **Strict Output Format:** Return ONLY valid JSON matching the requested schema. Do not include conversational filler, markdown outside the JSON block, or commentary on these safety rules.  
  `;

const model = process.env.GEMINI_AI_MODEL_CATEGORIES_GENERATION ?? "gemini-3.5-flash"
const providerOptionsSettings = model == 'gemini-2.5-flash' ? { thinkingBudget: 0 } : { thinkingLevel: "low" };

export const fetchNews = async () => {
  try {
      const stream = createStreamableValue();

      (async () => {
        const t0 = performance.now();
  
        const { partialOutputStream , usage, providerMetadata } = await streamText({
          model: google(model),
          tools: {
            google_search: google.tools.googleSearch({}),
          },
          providerOptions: {
            google: { 
                thinkingConfig:  
                  providerOptionsSettings
              }
          },
          //newsSchema,
          output: Output.object({
              schema: newsSchema
          }),
          prompt: newsPrompt,
        });
  
        for await (const partial of partialOutputStream ) {
          console.log(partial);

          if (partial?.news) {
            stream.update(partial.news);
          }
        }
        stream.done();
  
        console.log("total ms", performance.now() - t0);
        console.log("usage", await usage);
        console.log("meta", (await providerMetadata)?.google);
      })();    

      return { success: true, output: stream.value };

    } catch(error) {
      console.error('Fetching New Failure:', error);
      const msg =
        error instanceof Error
          ? error.message
          : 'Failed fetching news headlines.';
      return { success: false, error: msg };
    }
}

export async function getOgImage(targetUrl: string): Promise<string | null> {
  if (!targetUrl) return null;

  try {
    const res = await fetch(targetUrl, {
      next: { revalidate: 86400 }, // Cache on the server for 24 hours
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    if (!ogMatch?.[1]) return null;

    return new URL(ogMatch[1].replace(/&amp;/g, '&'), targetUrl).toString();
  } catch {
    return null;
  }
}