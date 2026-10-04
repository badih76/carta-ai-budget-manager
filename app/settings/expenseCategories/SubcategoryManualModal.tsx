'use client';

import React, { useState, useEffect } from 'react';
import { UAIExpenseCategory } from './categoriesListSchema';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface SubcategoryManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  majorCategories: UAIExpenseCategory[];
  selectedMajorCategory: string;
  onAddSubcategory: (newSub: UAIExpenseCategory) => void;
}

export function SubcategoryManualModal({
  isOpen,
  onClose,
  majorCategories,
  selectedMajorCategory,
  onAddSubcategory,
}: SubcategoryManualModalProps) {
  const [parentCategory, setParentCategory] = useState<string>('');
  const [subName, setSubName] = useState<string>('');
  const [subDesc, setSubDesc] = useState<string>('');
  const [subExamples, setSubExamples] = useState<string>('');

  useEffect(() => {
    if (selectedMajorCategory) {
      setParentCategory(selectedMajorCategory);
    } else if (majorCategories.length > 0) {
      setParentCategory(majorCategories[0].id);
    }
  }, [selectedMajorCategory, majorCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !parentCategory) return;

    const newSub: UAIExpenseCategory = {
      id: '',
      name: subName.trim(),
      description: subDesc.trim() || 'Custom sub-category configuration.',
      examples: subExamples ? subExamples.split(',').map((ex) => ex.trim()).filter(Boolean) : [],
      isSaved: false,
      level: 'sub',
      parent: parentCategory,
    };

    onAddSubcategory(newSub);
    setSubName('');
    setSubDesc('');
    setSubExamples('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Add New Subcategory
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Parent Major Category *</label>
            <select
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
              required
            >
              <option value={''}></option>
              {majorCategories.map((cat) => (
                <option key={cat.name} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Subcategory Name *</label>
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="e.g. Rent, Software Subscriptions, Fuel"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              value={subDesc}
              onChange={(e) => setSubDesc(e.target.value)}
              placeholder="Scope or policy guidelines for this subcategory..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Examples (comma-separated)</label>
            <input
              type="text"
              value={subExamples}
              onChange={(e) => setSubExamples(e.target.value)}
              placeholder="e.g. AWS, Vercel, Office Depot"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700">
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Add Subcategory
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}