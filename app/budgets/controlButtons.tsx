import React from 'react'
import { BudgetCategory } from './budgetPieChart'
import { Edit } from 'lucide-react'

interface IControlButtonsProps {
    triggerSmartAllocation: () => Promise<void>,
    isAllocating: boolean,
    handleReset: () => void,
    savedBudgets: BudgetCategory[] | null,
    isSavedNotice: boolean,
    handlePullCategoriesChange: () => Promise<void>,
    handleResetBudgetedCategories: () => Promise<void>,
    handleSaveBudget: () => Promise<void>,
    handleOnEditSelectedBudget: () => void
}

function ControlButtons({ triggerSmartAllocation, isAllocating, handleReset, 
    savedBudgets, isSavedNotice, handlePullCategoriesChange, 
    handleResetBudgetedCategories, handleSaveBudget, handleOnEditSelectedBudget }: IControlButtonsProps) {
  return (
    <div className="w-full flex items-center justify-start p-1.5 bg-slate-200/60 border border-slate-700/60 
        rounded-xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        {/* Vertical Separator Divider */}
        <div className="h-8 w-[2px] bg-slate-500/80 ml-0.5 mr-0.5" />
        {/* Vertical Separator Divider */}
        <div className="h-8 w-[2px] bg-slate-500/80 mr-2" />

        {/* Left Action: Auto Generate */}
        <div className="flex items-center gap-2">
            <div className="relative group">
                <button
                    onClick={triggerSmartAllocation}
                    disabled={isAllocating}
                    className={`p-2 rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center w-14 h-14 ${
                    isAllocating
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-b from-indigo-500 to-cyan-500  hover:from-emerald-400/30 hover:to-cyan-400/30 text-white active:scale-95'
                    }`}
                    aria-label="Auto Generate Budget"
                >
                    <span className={`leading-none text-2xl ${isAllocating ? 'animate-spin' : ''}`}>
                    🪄
                    </span>
                </button>

                {/* Tooltip */}
                <div className="absolute left-0 top-full mt-2 hidden group-hover:flex items-center z-20 pointer-events-none">
                    <div className="bg-slate-950 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-800 whitespace-nowrap shadow-xl">
                    {isAllocating ? 'Generating Allocations...' : 'Let AI Generate the Budget'}
                    </div>
                </div>
            </div>

            {/* Vertical Separator Divider */}
            <div className="h-5 w-[1px] bg-slate-700/80" />
        </div>

        {/* Right Group: Reset & Save Actions (Kept tightly together) */}
        <div className="flex items-center gap-1.5 ml-2">
            {/* Pull Categories Changes Button */}
            {/* <div className="relative group">
                <button
                    onClick={handlePullCategoriesChange}
                    className="p-2 text-purple-700 font-extrabold hover:text-white bg-white hover:bg-slate-300 border border-slate-700/60 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm w-14"
                    aria-label={savedBudgets ? 'Reset to Saved' : 'Reset to Zero'}
                > */}
                    {/* Rotate / Undo Icon */}
                    {/* <span className={`inline-block leading-none text-2xl ${isAllocating ? 'animate-spin' : ''}`}>
                        ⮯
                    </span>
                </button> */}

                {/* Tooltip */}
                {/* <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center z-20 pointer-events-none">
                    <div className="bg-slate-950 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-800 whitespace-nowrap shadow-xl">
                    {'Pull latest categories'}
                    </div>
                </div>
            </div> */}

            {/* Pull Categories Changes Button */}
            <div className="relative group">
                <button
                    onClick={handleOnEditSelectedBudget}
                    className="p-2 text-purple-700 font-extrabold hover:text-white bg-white hover:bg-slate-300 border border-slate-700/60 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm w-14 h-14"
                    aria-label={savedBudgets ? 'Reset to Saved' : 'Reset to Zero'}
                >
                    {/* Rotate / Undo Icon */}
                    <span className={`inline-block leading-none text-2xl m-auto ${isAllocating ? 'animate-spin' : ''}`}>
                        <Edit />
                    </span>
                </button>

                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center z-20 pointer-events-none">
                    <div className="bg-slate-950 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-800 whitespace-nowrap shadow-xl">
                    {'Edit Selected Budget'}
                    </div>
                </div>
            </div>

            {/* Reset Button */}
            <div className="relative group">
            <button
                onClick={handleResetBudgetedCategories}                
                className="p-2 text-slate-300 hover:text-white bg-white hover:bg-slate-300 border border-slate-700/60 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm w-14 h-14"
                aria-label={savedBudgets ? 'Reset to Saved' : 'Reset to Zero'}
            >
                {/* Rotate / Undo Icon */}
                <span className={`inline-block leading-none text-2xl ${isAllocating ? 'animate-spin' : ''}`}>
                {/* ♻️ */}
                    🔙
                </span>
            </button>

            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center z-20 pointer-events-none">
                <div className="bg-slate-950 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-800 whitespace-nowrap shadow-xl">
                {'Reset to Saved'}
                </div>
            </div>
            </div>

            {/* Save Button */}
            <div className="relative group">
            <button
                onClick={handleSaveBudget}
                disabled={isAllocating || isSavedNotice}
                className={`p-2.5 font-semibold rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center active:scale-95 w-14 h-14 ${
                isSavedNotice
                    ? 'bg-emerald-600 text-white'
                    // : 'bg-indigo-400 hover:bg-indigo-300 text-slate-950'
                    : 'bg-gradient-to-b from-indigo-500 to-indigo-300  hover:from-emerald-400/30 hover:to-cyan-400/30'
                }`}
                aria-label={isSavedNotice ? 'Saved!' : 'Save Budget'}
            >
                {isSavedNotice ? (
                /* Checkmark Icon */
                <span className={`leading-none text-2xl`}>
                    ✔
                </span>
                ) : (
                /* Save / Bookmark Icon */
                <span className={`leading-none text-2xl ${isAllocating ? 'animate-spin' : ''}`}>
                    💾
                </span>
                )}
            </button>

            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center z-20 pointer-events-none">
                <div className="bg-slate-950 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-800 whitespace-nowrap shadow-xl">
                {isSavedNotice ? '✓ Saved!' : 'Save Budget'}
                </div>
            </div>
            </div>
        </div>
    </div>
  )
}

export default ControlButtons