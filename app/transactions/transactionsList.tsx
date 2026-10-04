import React, { use } from 'react';
import { Loader2 } from 'lucide-react';
import { DBTransactions } from '@/src/drizzle/schema';
import { TransactionTable } from './transactionsTable';
import HttpStatus from '@/lib/HttpStatus';

interface ITransactionsListProps {
  transactionsPromise: Promise<{ status: number; data: DBTransactions[]; error?: string | undefined | null}>;
  userId: string | null;
  categoriesMap: Record<string, string> | null;
}

function TransactionsList({ transactionsPromise, userId, categoriesMap }: ITransactionsListProps) {
  // Suspend rendering until the transactionsPromise resolves
  const result = use(transactionsPromise);
  
  if (result.status !== HttpStatus.OK) {
    throw new Error(result.error || 'Failed to fetch transactions');
  }

  const transactions = result.data || [];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/20 text-center text-slate-400">
      {transactions && transactions.length > 0 ? (
        <TransactionTable
          data={transactions}
          userId={userId}
          categoriesMap={categoriesMap}
          isFetchingTransactions={false}
        />
      ) : (
        <NoTransactionsFound />
      )}
    </div>
  );
}

export const NoTransactionsFound = () => {
  return (
    <div className="w-full h-10 text-black flex justify-center items-center">
      No Transactions found for this account.
    </div>
  );
};

export const FetchingTransactions = () => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/20 w-full p-8 flex justify-center items-center text-white">
      <Loader2 className="text-white mr-2 h-10 w-10 animate-spin" />
      <span className="italic text-slate-300">Fetching Transactions for the selected account...</span>
    </div>
  );
};

export default TransactionsList;