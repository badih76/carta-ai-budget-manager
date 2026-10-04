import React, { ChangeEvent } from 'react';
import { Plus, Loader2 } from 'lucide-react';


interface ICatConfigPanelProps {
  selectedPurpose: string,
  handlePurposeChange: (e: React.ChangeEvent<HTMLSelectElement, Element>) => Promise<void>,
  purposeOptions: { key: string; label: string; }[],
  depthMode: "general" | "detailed",
  setDepthMode: React.Dispatch<React.SetStateAction<"general" | "detailed">>,
  addNewCategories: "replace" | "append",
  setAddNewCategories: React.Dispatch<React.SetStateAction<"replace" | "append">>,
  handleGenerateFromPurpose: () => Promise<void>,
  isAiLoading: boolean,
  customName: string,
  setCustomName: React.Dispatch<React.SetStateAction<string>>,
  customDesc: string,
  setCustomDesc: React.Dispatch<React.SetStateAction<string>>
  customExamples: string,
  setCustomExamples: React.Dispatch<React.SetStateAction<string>>,
  handleAddCustomCategory: () => void,
  categLevel: string,
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
}

const ControlConfigPanel = ({ selectedPurpose, handlePurposeChange, 
  purposeOptions, depthMode, setDepthMode, addNewCategories,
  setAddNewCategories, handleGenerateFromPurpose, isAiLoading, 
  customName, setCustomName, customDesc, setCustomDesc,
  customExamples, setCustomExamples, handleAddCustomCategory, 
  categLevel, setIsDirty }: ICatConfigPanelProps) => {
  return (
    <div className="lg:col-span-1 space-y-6 w-full">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-bold text-slate-200 uppercase tracking-wider">Strategy Purpose</label>
          <p className="text-[12px] text-slate-300">Pick a profile context archetype to seed item metadata distributions.</p>
        </div>

        <select
          value={selectedPurpose}
          onChange={handlePurposeChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {purposeOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>            

        {/* Categorization Depth Radio Options Panel Wrapper */}
        {
          categLevel !== 'major' ? 
            <div className="pt-3 flex flex-col md:flex-row w-full gap-2 border-t border-slate-400/60">
              <span className="text-[12px] font-bold text-slate-200 uppercase tracking-wider w-[33%]">Categorization Depth</span>
              
              <div className="flex flex-col md:flex-row gap-2 w-[66%] justify-between">
                {/* Option A: High-Level Overview */}
                <label className="flex items-center gap-2.5 cursor-pointer group text-xs text-slate-300 select-none">
                  <input
                    type="radio"
                    name="categorizationDepth"
                    value="general"
                    checked={depthMode === 'general'}
                    onChange={() => setDepthMode('general')}
                    className="w-3.5 h-3.5 accent-emerald-500 bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                  <div className="flex flex-col">
                    <span className="group-hover:text-white transition-colors font-medium">High-Level Overview</span>
                    <span className="text-[10px] text-slate-400">Broad buckets (e.g., Groceries, Auto)</span>
                  </div>
                </label>

                {/* Option B: Deep Granularity */}
                <label className="flex items-center gap-2.5 cursor-pointer group text-xs text-slate-300 select-none">
                  <input
                    type="radio"
                    name="categorizationDepth"
                    value="detailed"
                    checked={depthMode === 'detailed'}
                    onChange={() => setDepthMode('detailed')}
                    className="w-3.5 h-3.5 accent-emerald-500 bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                  <div className="flex flex-col">
                    <span className="group-hover:text-white transition-colors font-medium">Deep Granularity</span>
                    <span className="text-[10px] text-slate-400">Sub-divided categories (e.g., Produce, Meat, Fuel)</span>
                  </div>
                </label>
              </div>
            </div>  
            : null          
        }

        {/* How to add generated Categories to the list */}
        <div className="pt-3 flex flex-col gap-2 border-t border-slate-800/60 mt-2">
            <span className="text-[12px] font-medium text-slate-200 uppercase tracking-wider">Generated Categories</span>
            
            <div className="flex flex-col md:flex-row justify-center items-start gap-4">
                {/* Option 1: Full Suite */}
                <label className="flex items-center gap-2 cursor-pointer group text-xs text-slate-300 select-none w-[50%]">
                  <input
                      type="radio"
                      name="generationScope"
                      value="all"
                      checked={addNewCategories === 'append'}
                      onChange={() => setAddNewCategories('append')}
                      className="w-3.5 h-3.5 accent-emerald-500 bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                  <div className="flex flex-col">
                    <span className="group-hover:text-white transition-colors">Append to existing</span>
                    <span className="text-[10px] text-slate-400">Keep existing categories and add new categories to to them</span>
                  </div>
                </label>

                {/* Option 2: Tailored Subset */}
                <label className="flex items-center gap-2 cursor-pointer group text-xs text-slate-300 select-none w-[50%]">
                  <input
                      type="radio"
                      name="generationScope"
                      value="custom"
                      checked={addNewCategories === 'replace'}
                      onChange={() => setAddNewCategories('replace')}
                      className="w-3.5 h-3.5 accent-emerald-500 bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  />
                  <div className="flex flex-col">
                    <span className="group-hover:text-white transition-colors">Replace existing</span>
                    <span className="text-[10px] text-slate-400">Remove existing categories and add the new ones</span>
                  </div>
                </label>
            </div>
        </div>

        <button
          onClick={handleGenerateFromPurpose}
          disabled={isAiLoading}
          className={`w-full py-1.5 text-sm font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 ${
            isAiLoading
              ? 'bg-[linear-gradient(90deg,_#ef4444,_#f97316,_#eab308,_#10b981,_#06b6d4,_#3b82f6,_#8b5cf6,_#ec4899,_#ef4444)] bg-[length:1000%_100%] animate-[rainbowSlide_3s_linear_infinite] text-white cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isAiLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
              Carta-AI is generating Major Categories...
            </>
          ) : (
            <>
              <span className="text-lg">✨</span>
              Let Carta-AI generate Major Categories for me...
            </>
          )}
        </button>
      </div>

      {/* Creation Form block */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Add Custom Tracker</h3>
        <div className="space-y-2.5">
          <input 
            type="text"
            placeholder="Category Name"
            value={customName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input 
            type="text"
            placeholder="Summary description..."
            value={customDesc}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input 
            type="text"
            placeholder="Examples (comma separated)"
            value={customExamples}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomExamples(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={handleAddCustomCategory}
            className="w-full py-2 bg-indigo-700 border border-slate-700 hover:bg-indigo-500 hover:border-slate-600 text-sm font-bold text-white rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Insert Category
          </button>
        </div>
      </div>
    </div>
  )
}

export default ControlConfigPanel