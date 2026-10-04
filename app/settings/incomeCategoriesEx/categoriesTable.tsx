import React, { ChangeEvent} from 'react'
import { UAIIncomeCategory } from './categoriesListSchema';
import { cn } from '@/lib/utils';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface IExpCategTableProps {
  categories: UAIIncomeCategory[],
  editingIndex: number | null,
  editName: string,
  setEditName: React.Dispatch<React.SetStateAction<string>>,
  editDesc: string,
  setEditDesc: React.Dispatch<React.SetStateAction<string>>,
  editExamples: string,
  setEditExamples: React.Dispatch<React.SetStateAction<string>>,
  saveRowMutations: (indexToUpdate: number) => void,
  startEditing: (index: number, currentItem: {
    id: string,
    name: string;
    description: string;
    examples: string[];
    level: string;
    parent: string;
  }) => void,
  setEditingIndex: (value: React.SetStateAction<number | null>) => void,
  handleDeleteCategory: (indexToRemove: number) => void,
  categLevel: string
}

function CategoriesTable({ 
  categories, editingIndex, editName, setEditName, editDesc, setEditDesc,
  editExamples, setEditExamples, saveRowMutations, startEditing,
  setEditingIndex, handleDeleteCategory, categLevel }: IExpCategTableProps) {

  return (
    <table className="w-full text-left border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <th className="p-4 w-1/4">Category Dimension</th>
          <th className="p-4 w-1/3">Functional Scope Description</th>
          <th className="p-4 w-1/4">Item Class Examples</th>
          <th className="p-4 text-center w-12">Edit</th>
          <th className="p-4 text-center w-12">Delete</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/60 bg-slate-950/20">
        {categories.length === 0 ? (
          <tr>
            <td colSpan={5} className="p-8 text-center text-sm text-slate-300">
              No categories configured yet. Stream a model blueprint stack or use the custom module block on the left side menu.
            </td>
          </tr>
        ) : (
          categories && categories.length > 0 ?
          categories.map((cat, index) => {
            const isEditing = editingIndex === index;

            if(categLevel == cat.level) {
              return (
                <tr key={index} 
                  className={cn(index % 2 === 1 ? 'bg-slate-700' : 'bg-slate-600', "hover:bg-slate-900/40 transition-colors")}>
                  {/* Column 1: Category Name */}
                  <td className="p-4 align-top font-medium text-slate-200">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                        className="bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-xs text-slate-200 w-full"
                      />
                    ) : (
                      cat.name
                    )}
                  </td>

                  {/* Column 2: Description */}
                  <td className="p-4 align-top text-xs text-slate-300 leading-relaxed">
                    {isEditing ? (
                      <textarea
                        value={editDesc}
                        rows={2}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditDesc(e.target.value)}
                        className="bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-xs text-slate-200 w-full resize-none"
                      />
                    ) : (
                      cat.description
                    )}
                  </td>

                  {/* Column 3: Examples */}
                  <td className="p-4 align-top">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editExamples}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditExamples(e.target.value)}
                        className="bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-xs text-slate-200 w-full"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.examples && cat.examples.length > 0 ? cat.examples.map((ex, i) => (
                          <span key={i} className="text-[10px] bg-gray-300 border border-slate-800 px-2 py-0.5 rounded text-gray-900">
                            {ex}
                          </span>
                        )) : null }
                      </div>
                    )}
                  </td>

                  {/* Column 4: Edit Operations Call */}
                  <td className="p-4 text-center align-top">
                    {isEditing ? (
                      <button
                        onClick={() => saveRowMutations(index)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 bg-slate-900 border border-slate-800 rounded"
                        title="Save Changes"
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(index, cat)}
                        className="text-slate-300 hover:text-slate-200 transition-colors p-1"
                        title="Rename"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </td>

                  {/* Column 5: Delete Operations Call */}
                  <td className="p-4 text-center align-top">
                    {isEditing ? (
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="text-slate-300 hover:text-slate-400 transition-colors p-1 bg-slate-900 border border-slate-800 rounded"
                        title="Cancel Edit"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <Button
                        variant={'ghost'}
                        onClick={() => handleDeleteCategory(index)}
                        disabled={cat.isSaved}
                        className="text-slate-300 hover:text-red-400 hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-colors p-1"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </Button>

                    )}
                  </td>
                </tr>
              );
            }
          })
          : null
        )}
      </tbody>
    </table>
  )
}

export default CategoriesTable