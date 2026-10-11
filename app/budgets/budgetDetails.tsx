import { DBExpenseBudgets } from '@/src/drizzle/schema'
import React from 'react'
import { TExpenseCategBudget } from './types'

interface IBudgetDetailsProps {
    selectedBudget: DBExpenseBudgets | null,
    totalBudgeted: number,
    budgetedCategories: TExpenseCategBudget[],
    remainingAllowance: number,
}

function BudgetDetails({ selectedBudget, totalBudgeted, budgetedCategories, remainingAllowance }: IBudgetDetailsProps) {
  return (    
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        {/* Full Width Budget Name Header */}
        <div className="border-b border-slate-800/80 pb-3">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
            Budget Plan
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
            {selectedBudget?.name}
            </h2>
        </div>

        {/* 3-Column Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Cycle Expenditure Allowance
            </span>
            <p className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">
                ${parseFloat(selectedBudget?.initAllocatedAmount!).toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{selectedBudget?.name}</p>
            </div>

            <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Total Allocated
            </span>
            <p
                className={`text-2xl font-extrabold font-mono mt-1 ${
                totalBudgeted > parseFloat(selectedBudget?.initAllocatedAmount!) ? 'text-red-400' : 'text-white'
                }`}
            >
                ${totalBudgeted.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{budgetedCategories.length} Expense Categories</p>
            </div>

            <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Unallocated Remaining
            </span>
            <p
                className={`text-2xl font-extrabold font-mono mt-1 ${
                remainingAllowance < 0 ? 'text-red-400' : 'text-slate-300'
                }`}
            >
                ${remainingAllowance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
                {remainingAllowance < 0 ? 'Exceeds cycle allowance' : 'Available for distribution'}
            </p>
            </div>
        </div>
        </div>
  )
}

export default BudgetDetails