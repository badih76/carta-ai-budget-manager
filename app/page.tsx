'use client'
import React, { useEffect, useState } from 'react';
import { fetchNews } from './home/actions';
import { readStreamableValue } from '@ai-sdk/rsc';
import { HomePageNewsCard } from '@/src/components/HomePageNewsCard';
import { Loader2 } from 'lucide-react';

interface INewsElement {
  id: number,
  title: string,
  briefParagraph: string,
  sourceUrl: string
}

export default function HomePage() {
  const [ newsElements, setNewsElements ] = useState<INewsElement[]>([]);
  const [ isFetchingNews, setIsFetchingNews ] = useState<boolean>(false);

  useEffect(() => {
    const getNews = async () => {
      setIsFetchingNews(true);

      try {
        const newsResults = await fetchNews();
        
        if (newsResults.success && newsResults.output) {
          for await (const partial of readStreamableValue(newsResults.output)) {
            if (Array.isArray(partial)) {
              const list = (partial as INewsElement[]).map((item) => ({
                id: item.id,
                title: item.title,
                briefParagraph: item.briefParagraph || '',
                sourceUrl: item.sourceUrl || '',                
              }));
              console.log(list);
              setNewsElements(list);
            }
          }
        }
      } catch(error) {
        console.log((error as Error).message);
      }
      setIsFetchingNews(false);
    }

    getNews();

  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <div className='w-full flex-col'>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome to Carta-AI Budget Maker</h1>
          <p className="text-sm text-white">Real-time health snapshot and predictive insights.</p>
        </div>
        <div className='mt-6 w-full p-4 border-2 border-gray-500 rounded-md flex flex-col gap-4'>
          <div className='w-full text-lg font-bold text-white'>
            Trending News
          </div>
          <div className='w-full'>
            {
              isFetchingNews && newsElements.length == 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-red-600" /> :
              newsElements.length > 0 ? 
                newsElements.map((ne, index: number) => (
                  <HomePageNewsCard
                    key={`news-${ne.id}-${ne.sourceUrl}-${index}`} 
                    title={ne.title} 
                    paragraph={ne.briefParagraph} 
                    url={ne.sourceUrl}                
                  />
                )) : 'No news found'
            }
          </div>
        </div>
      </div>    
    </>
  );
}