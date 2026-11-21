'use client';

import { ArrowRight, Bell, Newspaper, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export interface NewsCardProps {
  title: string;
  paragraph: string;
  url: string;
  badgeText?: string;
  featuredLabel?: string;
  buttonText?: string;
}

export function HomePageNewsCard({
  title,
  paragraph,
  url,
  buttonText = "Read More",
}: NewsCardProps) {

  return (
    <Card className="flex h-full w-full flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-5 shadow-none">
      <CardContent className="p-0">                
        <div className="space-y-2">
          <h3 className="text-sm font-semibold leading-snug tracking-tight text-zinc-950">
            {title}
          </h3>
          <p className="text-xs leading-relaxed text-zinc-700">
            {paragraph}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-0 pt-2">
        <Button variant={"link"}
        //   className="h-11 w-full rounded-xl bg-zinc-950 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex justify-center items-center">
            <span>{buttonText}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}