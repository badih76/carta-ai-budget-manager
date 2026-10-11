import React from 'react'
import { Loader2, Sparkles, Trash2, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { UAIIncomeCategory } from './categoriesListSchema';
import { cn } from '@/lib/utils';

interface ISubCategMatrixTableProps {
    majorCategories: UAIIncomeCategory[],
    subCategories: UAIIncomeCategory[],
    openAiNavigator: (majorName?: string | undefined) => void,
    handleDeleteSubCategory: (subName: string, parentName: string) => void,
    resetSubCategories: () => Promise<void>,
    isSubSaving: boolean, 
    isSubResetting: boolean,
    saveSubCategories: () => Promise<void>
}

function SubCategoriesMatrixTable({ majorCategories, subCategories, 
    openAiNavigator, handleDeleteSubCategory, resetSubCategories,
    isSubSaving, isSubResetting, saveSubCategories
}: ISubCategMatrixTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
            <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono">
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Category Name</th>
                {/* <th className="py-3 px-4 font-medium uppercase tracking-wider">Parent Category</th> */}
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Examples</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
                {majorCategories.length === 0 ? (
                <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                    No major categories available. Please add major categories first.
                    </td>
                </tr>
                ) : (
                majorCategories.map((major) => {
                    const childSubCategories = subCategories
                        .filter(
                            (sub) => sub.parent?.toLowerCase() === major.id.toLowerCase()
                        );

                    return (
                    <React.Fragment key={major.name}>
                        {/* Major Category Header Row */}
                        <tr className="bg-slate-900/80 font-medium text-slate-100 border-t border-slate-800">
                            <td className="py-3 px-4 flex items-center space-x-2">
                                <Folder className="w-4 h-4 text-indigo-400" />
                                <span className="font-semibold text-white">{major.name}</span>
                            </td>
                            {/* <td className="py-3 px-4 text-slate-500 italic">—</td> */}
                            <td className="py-3 px-4 text-slate-300 text-xs max-w-xs truncate">{major.description}</td>
                            <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                {
                                    major.examples && major.examples.length > 0 ? 
                                    major.examples.slice(0, 3).map((ex, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                        {ex}
                                    </span>
                                    ))
                                    : null
                                }
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openAiNavigator(major.name)}
                                className="text-purple-300 hover:text-purple-100 hover:bg-purple-950/50 text-[11px] h-7 gap-1"
                                >
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                + AI Suggestions
                                </Button>
                            </td>
                        </tr>

                        {/* Nested Child Subcategories */}
                        {childSubCategories.length === 0 ? (
                        <tr className="bg-slate-950/30 text-slate-500">
                            <td colSpan={5} className="py-2 pl-8 pr-4 text-[11px] italic">
                            No subcategories under "{major.name}". Click "+ AI Suggestions" or "+ Add Subcategory" to add items.
                            </td>
                        </tr>
                        ) : (
                        childSubCategories.map((sub, i: number) => (
                            <tr key={`${sub.parent}-${sub.id}`} 
                                className={cn(i % 2 === 1 ? "bg-white" : "bg-indigo-200", "hover:bg-indigo-300 text-indigo-600 transition-colors")}>
                                <td className="py-2.5 px-4 pl-8 flex items-center space-x-2">
                                    <span className="text-slate-600">└─</span>
                                    <span className="font-medium text-indigo-600">{sub.name}</span>
                                    {!sub.isSaved && (
                                    <span className="text-[9px] bg-purple-900/60 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono ml-1">
                                        NEW
                                    </span>
                                    )}
                                </td>
                                {/* Solid white Parent Category name as explicitly requested */}
                                {/* <td className="py-2.5 px-4 font-semibold text-indigo-400">
                                    {major.name}
                                </td> */}
                                <td className="py-2.5 px-4 text-slate-600 align-top text-[11px] max-w-sm">
                                    {sub.description}
                                </td>
                                <td className="py-2.5 px-4">
                                    <div className="flex flex-wrap gap-1">
                                    {sub.examples && sub.examples.length > 0 ? (
                                        sub.examples.map((ex, exIdx) => (
                                        <span key={exIdx} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px]">
                                            {ex}
                                        </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 text-[10px] italic">None listed</span>
                                    )}
                                    </div>
                                </td>
                                <td className="py-2.5 px-4 text-right">
                                    <button 
                                    onClick={() => handleDeleteSubCategory(sub.name, major.name)} 
                                    className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                                    title="Delete Subcategory"
                                    >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                        )}
                    </React.Fragment>
                    );
                })
                )}
            </tbody>
            </table>
        </div>

        {/* Footer Controls */}
        <div className="flex justify-end items-center gap-2 p-4 bg-slate-900/80 border-t border-slate-800">
            <Button 
            variant={'outline'} 
            className='w-28'
            onClick={resetSubCategories} 
            disabled={isSubSaving || isSubResetting}
            >
            {isSubResetting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
                </>
            ) : (
                'Reset'
            )}
            </Button>

            <Button 
            variant={'default'} 
            className='w-28 bg-emerald-600 hover:bg-emerald-500 text-white'
            onClick={saveSubCategories}
            disabled={isSubSaving || isSubResetting}
            >
            {isSubSaving ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
                </>
            ) : (
                'Save'
            )}
            </Button>
        </div>
    </div>
  )
}

export default SubCategoriesMatrixTable