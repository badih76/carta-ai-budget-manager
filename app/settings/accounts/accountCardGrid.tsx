import { DBAccount } from '@/src/drizzle/schema'
import { Pencil } from 'lucide-react'
import React, { JSX } from 'react'

interface IAccountCardGridProps {
    accounts: DBAccount[],
    handleOpenEdit: (acc: DBAccount, index: number) => void,
    getAccountIcon: (typeStr: string) => JSX.Element
}

function AccountCardGrid({ accounts, handleOpenEdit, getAccountIcon }: IAccountCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc, index) => (
          <div
            key={acc.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm hover:border-slate-700 transition-all space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {acc.type} Account
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(acc, index)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {getAccountIcon(acc.type)}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{acc.name}</p>
            </div>
          </div>
        ))}
      </div>
  )
}

export default AccountCardGrid