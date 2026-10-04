// components/TransactionTable.tsx
'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { getExpenseCategoryNameById } from '../settings/expenseCategories/actions';
import HttpStatus from '@/lib/HttpStatus';
import { ToastError } from '@/lib/sonnerUtils';
import { getTransactionBreakdown } from './actions';
import { DBTransactionBreakdown } from '@/src/drizzle/schema';

// TypeScript Interface matching your Drizzle MySQL schema
export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  createDate: Date | string;
  effectDate: Date | string;
  amount: string | number;
  type: string; // 'DB' | 'CR'
  category: string;
  notes?: string | null;
  balance: string | number;
}

interface TransactionTableProps {
  data: Transaction[];
  userId: string | null;
  categoriesMap: Record<string, string> | null;
  isFetchingTransactions: boolean;
}

export function TransactionTable({ data, userId, categoriesMap, isFetchingTransactions }: TransactionTableProps) {
    const [sortedData, setSortedData] = useState<Transaction[]>([]);
    const [tBreakDown, setTBreakdown] = useState<DBTransactionBreakdown[]>([]);
    const [transactionOpen, setTransactionOpen] = useState<boolean[]>([]);
    
  // Helper to format currency
  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(isNaN(num) ? 0 : num);
  };

  // Helper to format dates
  const formatDate = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    return isNaN(d.getTime())
      ? '-'
      : d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
  };

  useEffect(() => {
      if (!data || data.length === 0) {
        setSortedData([]);
        return;
      }

      const sorted = [...data].sort((a, b) => {
          // 1. Helper to safely convert MySQL timestamp strings to valid millisecond timestamps
          const getTime = (dateVal: Date | string) => {
          if (dateVal instanceof Date) return dateVal.getTime();
          if (typeof dateVal === 'string') {
              // Replace space with 'T' so JS Date constructor parses ISO-8601 correctly
              const isoString = dateVal.includes(' ') ? dateVal.replace(' ', 'T') : dateVal;
              const parsed = new Date(isoString).getTime();
              
              // If still NaN, fallback to direct string comparison for "YYYY-MM-DD HH:mm:ss"
              return isNaN(parsed) ? dateVal : parsed;
          }
          return 0;
          };

          const timeA = getTime(a.effectDate);
          const timeB = getTime(b.effectDate);

          // 2. Handle numeric timestamp comparison vs string comparison
          if (typeof timeA === 'number' && typeof timeB === 'number') {
          return timeB - timeA; // Descending (latest date first)
          }

          // String fallback comparison (works because YYYY-MM-DD HH:mm:ss sorts chronologically)
          return String(timeB).localeCompare(String(timeA));
      });

      setSortedData(sorted);

      let tOpen: boolean[] = [];

      sorted.map(t => {
        tOpen.push(false);        
      });

      setTransactionOpen(tOpen);
  }, [data]);

  

  const handleGetCategoryById = async (categId: string) => {
      try {
          const result = await getExpenseCategoryNameById(userId!, categId);

          if(result.status != HttpStatus.OK)
              throw new Error(result.error!);

          return result.data;
      } catch(error) {
          ToastError(`There was a problem fetching Expense Category Name. ${(error as Error).message}.`);
          return 'Expense Category Not Found!';
      }
  }

  const handleGetTransBreakdown = async (transId: string) => {
    const found = tBreakDown.find(tbd => tbd.transactionId == transId);

    if(!found) {
      try {
        const result = await getTransactionBreakdown(transId);

        if(result.status != HttpStatus.OK)
          throw new Error(result.error!);

        if(result.data.length == 0)
          return (
            <div>
              Nothing was found.
            </div>  
          )
        else 
          return (
            <div>
              {
                result.data.map((d: DBTransactionBreakdown) => {
                  
                  return (
                    <>
                      <div>
                        { d.details }
                      </div>
                      <div>
                        { d.unitPrice }
                      </div>
                      <div>
                        { d.quatity }
                      </div>
                      <div>
                        { d.totalPrice}
                      </div>
                    </>   
                  )
                })
              }
            </div>
          )
      } catch(error) {
        ToastError((error as Error).message);
      }
    } else {
      return (
        <div>
          {
            tBreakDown.map((d: DBTransactionBreakdown) => {
              if(d.transactionId == transId)
                return (
                  <>
                    <div>
                      { d.details }
                    </div>
                    <div>
                      { d.unitPrice }
                    </div>
                    <div>
                      { d.quatity }
                    </div>
                    <div>
                      { d.totalPrice}
                    </div>
                  </>   
                )
            })
          }
        </div>
      )
    }
  }

  const handleOnTransClick = (transIndex: number, transId: string) => {
    let to = [...transactionOpen];

    to[transIndex] = !to[transIndex];
    setTransactionOpen(to);
    
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400 font-mono tracking-wider">
          <tr>
            <th scope="col" className="py-3.5 px-4 font-semibold">
              Effective Date
            </th>
            <th scope="col" className="py-3.5 px-4 font-semibold">
              Category
            </th>
            <th scope="col" className="py-3.5 px-4 font-semibold">
              Notes
            </th>
            <th scope="col" className="py-3.5 px-4 font-semibold">
              Type
            </th>
            <th scope="col" className="py-3.5 px-4 font-semibold text-right">
              Amount
            </th>
            <th scope="col" className="py-3.5 px-4 font-semibold text-right">
              Balance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">            
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((tx, i: number) => {
                const isDebit = tx.type === 'DB';
                const formattedAmount = formatCurrency(tx.amount);
                const categoryName = categoriesMap ? categoriesMap[tx.category] : null;

              return (
                <>
                  <tr
                    key={tx.id}
                    className={cn("hover:bg-slate-800/30 transition-colors", i % 2 == 1 ? 'bg-slate-400' : '')}
                    onClick={() => handleOnTransClick(i, tx.id)}
                  >
                    {/* Effective Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-white">
                      {formatDate(tx.effectDate)}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-medium text-white">
                      {tx.category ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700/50">
                          {categoryName ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700/50">
                              {categoryName}
                              </span>
                          ) : (
                              <span className="text-slate-500 italic text-xs">Uncategorized</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-xs">
                          Uncategorized
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 max-w-xs truncate text-white">
                      {tx.notes || <span className="text-slate-600">—</span>}
                    </td>

                    {/* Type Badge (DB vs CR) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          isDebit
                            ? 'bg-red-800 text-red-300 border border-rose-800/40'
                            : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3 px-4 text-right font-mono font-semibold whitespace-nowrap ${
                        isDebit ? 'text-slate-200' : 'text-emerald-400'
                      }`}
                    >
                      {isDebit ? `-${formattedAmount}` : `+${formattedAmount}`}
                    </td>

                    {/* Balance */}
                    <td className={cn("py-3 px-4 text-right font-mono whitespace-nowrap font-bold", 
                      typeof tx.balance === 'string' ? parseFloat(tx.balance) >= 0 ? "text-white" : i % 2 == 1 ? "text-red-200" : "text-red-300" 
                          : tx.balance >= 0 ? "text-white" : i % 2 == 1 ? "text-red-200" : "text-red-300" )}>
                      {formatCurrency(tx.balance)}
                    </td>
                  </tr>
                  <tr className={!transactionOpen[i] ? 'hidden' : '' }>
                      { // display transactions breakdown
                        handleGetTransBreakdown(tx.id)
                      }
                  </tr>
                </>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={6}
                className="py-8 text-center text-slate-500 text-sm"
              >
                No transactions recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}