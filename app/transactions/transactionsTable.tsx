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
  
  // Store breakdowns mapped by transactionId: { [transId]: DBTransactionBreakdown[] }
  const [breakdownMap, setBreakdownMap] = useState<Record<string, DBTransactionBreakdown[]>>({});
  const [loadingBreakdowns, setLoadingBreakdowns] = useState<Record<string, boolean>>({});
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

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
      const getTime = (dateVal: Date | string) => {
        if (dateVal instanceof Date) return dateVal.getTime();
        if (typeof dateVal === 'string') {
          const isoString = dateVal.includes(' ') ? dateVal.replace(' ', 'T') : dateVal;
          const parsed = new Date(isoString).getTime();
          return isNaN(parsed) ? dateVal : parsed;
        }
        return 0;
      };

      const timeA = getTime(a.effectDate);
      const timeB = getTime(b.effectDate);

      if (typeof timeA === 'number' && typeof timeB === 'number') {
        return timeB - timeA;
      }

      return String(timeB).localeCompare(String(timeA));
    });

    setSortedData(sorted);
  }, [data]);

  // Handle row click & async data fetching cleanly
  const handleOnTransClick = async (transId: string) => {
    // Toggle state
    setOpenRows((prev) => ({ ...prev, [transId]: !prev[transId] }));

    // Fetch breakdown only if not already loaded
    if (!breakdownMap[transId]) {
      try {
        setLoadingBreakdowns((prev) => ({ ...prev, [transId]: true }));
        const result = await getTransactionBreakdown(transId);

        if (result.status !== HttpStatus.OK) {
          throw new Error(result.error!);
        }

        setBreakdownMap((prev) => ({
          ...prev,
          [transId]: result.data || [],
        }));
      } catch (error) {
        ToastError((error as Error).message);
      } finally {
        setLoadingBreakdowns((prev) => ({ ...prev, [transId]: false }));
      }
    }
  };

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
          {
            sortedData && sortedData.length > 0 ? (
              sortedData.map((tx, i: number) => {
                const isDebit = tx.type === 'DB';
                const formattedAmount = formatCurrency(tx.amount);
                const categoryName = categoriesMap ? categoriesMap[tx.category] : null;
                const isOpen = !!openRows[tx.id];
                const isLoading = !!loadingBreakdowns[tx.id];
                const items = breakdownMap[tx.id] || [];

                return (
                  <React.Fragment key={tx.id}>
                    {/* Main Row */}
                    <tr
                      className={cn(
                        'hover:bg-slate-800/50 cursor-pointer transition-colors',
                        i % 2 === 1 ? 'bg-slate-900/20' : 'bg-transparent'
                      )}
                      onClick={() => handleOnTransClick(tx.id)}
                    >
                      {/* Effective Date */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-white">
                        {formatDate(tx.effectDate)}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-medium text-white">
                        {tx.category ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700/50">
                            {categoryName ? categoryName : <span className="text-slate-500 italic text-xs">Uncategorized</span>}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Uncategorized</span>
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
                              ? 'bg-red-950/60 text-red-300 border border-rose-800/40'
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
                      <td
                        className={cn(
                          'py-3 px-4 text-right font-mono whitespace-nowrap font-bold',
                          typeof tx.balance === 'string'
                            ? parseFloat(tx.balance) >= 0
                              ? 'text-white'
                              : 'text-red-300'
                            : tx.balance >= 0
                            ? 'text-white'
                            : 'text-red-300'
                        )}
                      >
                        {formatCurrency(tx.balance)}
                      </td>
                    </tr>

                    {/* Expandable Breakdown Row */}
                    {isOpen && (
                      <tr className="bg-slate-400 border-t border-b border-slate-800">
                        <td colSpan={6} 
                          className="pt-4 pb-4"
                        >
                          {isLoading ? (
                            <div className="text-xs text-slate-600 italic pl-4">Loading breakdown...</div>
                          ) : items.length === 0 ? (
                            <div className="text-xs text-slate-800 pl-4">No breakdown details available.</div>
                          ) : (
                            <div className="w-full">
                              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2 ml-4">
                                Transaction Breakdown
                              </h4>
                              <div className="pl-4 grid grid-cols-5 gap-2 text-xs text-slate-800 font-mono border-b border-slate-800 pb-1 font-bold">
                                <div>Details</div>
                                <div>Unit Price</div>
                                <div>Quantity</div>
                                <div>Total Price</div>
                                <div>Category</div>
                              </div>
                              {items.map((item, idx) => (
                                <div key={item.id || idx} className={`pl-4 grid grid-cols-5 gap-2 text-xs font-mono py-1 border-b border-slate-900/50 ${idx % 2 == 1 ? 'bg-slate-200 text-slate-600' : 'bg-slate-600 text-slate-200'}`}>
                                  <div>{item.details}</div>
                                  <div>{formatCurrency(item.unitPrice)}</div>
                                  <div>{(item as any).quatity ?? item.quatity}</div>
                                  <div>{formatCurrency(item.totalPrice)}</div>
                                  <div>{categoriesMap ? categoriesMap[item.category] : 'Uncategoriezed'}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) 
            : isFetchingTransactions 
            ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-sm italic">
                  Fetching transactions...
                </td>
              </tr>
            ) 
            : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                  No transactions recorded yet.
                </td>
              </tr>
            )
          }
        </tbody>
      </table>
    </div>
  );
}