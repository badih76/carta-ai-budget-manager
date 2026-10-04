// app/page.tsx
import React from 'react';

export default async function HomePage() {
  
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome to Carta-AI Budget Maker</h1>
          <p className="text-sm text-slate-400">Real-time health snapshot and predictive insights.</p>
        </div>
      </div>    
    </>
  );
}