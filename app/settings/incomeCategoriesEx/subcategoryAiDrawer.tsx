'use client';

import React, { useState, useEffect } from 'react';
import { UAIIncomeCategory } from './categoriesListSchema';
import { generatePurposeCategoriesActionEx, generateSubCategoriesAction } from './actions';
import { readStreamableValue } from '@ai-sdk/rsc';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';

interface SubcategoryAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPurpose: string;
  targetMajorCategory: string;
  majorCategories: UAIIncomeCategory[];
  subCategories: UAIIncomeCategory[];
  onAddSubcategories: (subCategories: UAIIncomeCategory[]) => void;
}

export function SubcategoryAiDrawer({
  isOpen,
  onClose,
  selectedPurpose,
  targetMajorCategory,
  majorCategories,
  subCategories,
  onAddSubcategories,
}: SubcategoryAiDrawerProps) {
  const [parentMajor, setParentMajor] = useState<string>(targetMajorCategory);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<(UAIIncomeCategory & { selected: boolean })[]>([]);
  const [majorCategory, setMajorCategory] = useState<UAIIncomeCategory>();

  useEffect(() => {
    if (isOpen) {
      if (targetMajorCategory) setParentMajor(targetMajorCategory);
      setSuggestions([]); // Clear suggestions whenever a new category is selected or drawer opens
      // Get the major category object from major categories list based on the name 
      const majorCateg = majorCategories.find((mc: UAIIncomeCategory) => mc.name == targetMajorCategory);
      setMajorCategory(majorCateg);
    }
  }, [targetMajorCategory, isOpen]);

  if (!isOpen) return null;

  const handleFetchSuggestions = async () => {
    if (!parentMajor) return;
    setIsLoading(true);
    setSuggestions([]);

    // Get the major category object from major categories list based on the name 
    const majorCategory = majorCategories.find((mc: UAIIncomeCategory) => mc.name == targetMajorCategory);

    // Extract the list of sub-categories for the tagetted major category based on the targetted major category's id...
    const targetSubCategory = subCategories.filter(sc => sc.parent == majorCategory?.id);  

    try {
      const response = await generateSubCategoriesAction(selectedPurpose, majorCategory!, targetSubCategory);

      if (response.success && response.output) {
        for await (const partial of readStreamableValue(response.output)) {
          if (Array.isArray(partial)) {
            const list = (partial as any[]).map((item) => ({
              id: '',
              name: item.name,
              description: item.description || '',
              examples: item.examples || [],
              isSaved: false,
              level: 'sub',
              parent: majorCategory?.id!,
              selected: true,
            }));
            setSuggestions(list);
          }
        }
      }
    } catch (err) {
      console.error('Error in Gemini Navigator:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (index: number) => {
    setSuggestions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleApply = () => {
    const selectedItems = suggestions
      .filter((item) => item.selected)
      .map(({ selected, ...rest }) => ({
        ...rest,
        level: 'sub',
        parent: majorCategory?.id!,
      }));

    onAddSubcategories(selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-purple-950/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Gemini Navigator</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Major Category Context</label>
              <select
                value={parentMajor}
                onChange={(e) => setParentMajor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 focus:border-purple-500"
              >
                {majorCategories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleFetchSuggestions}
              disabled={isLoading || !parentMajor}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium gap-2 py-2.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating Recommendations...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate AI Recommendations
                </>
              )}
            </Button>

            {suggestions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Suggested Items ({suggestions.filter((s) => s.selected).length} selected)</span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleSelection(idx)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        item.selected
                          ? 'bg-purple-950/30 border-purple-500/50 text-purple-100'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white">{item.name}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            item.selected ? 'bg-purple-600 border-purple-400' : 'border-slate-600'
                          }`}
                        >
                          {item.selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
                      {item.examples.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.examples.map((ex, exIdx) => (
                            <span key={exIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px]">
                              {ex}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} 
                className="border-slate-800 text-black hover:bg-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!suggestions.some((s) => s.selected)}
                className="bg-purple-600 hover:bg-purple-500 text-white"
              >
                Add Selected to Matrix
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}