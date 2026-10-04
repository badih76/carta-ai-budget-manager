// app/transactions/page.tsx
'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { getCategories, getTransactionsByAccountId, parseReceiptAction, saveNewTransactionsAndBreakdowns } from './actions';
import { ExtractedReceipt } from './receiptSchema';
import { readStreamableValue } from '@ai-sdk/rsc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DBAccount, DBExpenseCategory, DBIncomeCategory, NewDBTransactionBreakdown, NewDBTransactions } from '@/src/drizzle/schema';
import { ToastError, ToastMessage } from '@/lib/sonnerUtils';
import HttpStatus from '@/lib/HttpStatus';
import { getAccounts } from '../settings/accounts/actions';
import { getCategoryMap } from '../settings/expenseCategories/actions';
import SelectAccount from './selectAccount';
import TransactionsList, { FetchingTransactions } from './transactionsList';
import TransactionsInputsBlock from './transactionsInputs';
import NewTransactionsList from './newTransactionsList';
import { Button } from '@/components/ui/button';
import { getIncomeCategories } from '../settings/incomeCategoriesEx/actions';
import { v4 as uuidv4 } from 'uuid';

export default function TransactionsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedReceipt | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accounts, setAccounts] = useState<DBAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<DBAccount>();
  const [userId, setUserId] = useState<string | null>('');
  const [transactionsEx, setTransactionsEx] = useState<ExtractedReceipt[]>([]);
  const [expCategoriesMap, setExpCategoriesMap] = useState<Record<string, string> | null>(null);
  const [incCategoriesMap, setIncCategoriesMap] = useState<Record<string, string> | null>(null);
  const [allCategoriesMap, setAllCategoriesMap] = useState<Record<string, string> | null>(null);
  const [selectedAccountPurpose, setSelectedAccountPurpose] = useState<string>('');
  const [categories, setCategories] = useState<DBExpenseCategory[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<DBIncomeCategory[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('list');
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  const [transactionsPromise, setTransactionsPromise] = useState<Promise<any> | null>(null);

  // Trigger Server Action fetch after render lifecycle completes
  useEffect(() => {
    if (userId != null && selectedAccount?.id) {
      const promise = getTransactionsByAccountId(userId, selectedAccount.id);
      setTransactionsPromise(promise);
    } else {
      setTransactionsPromise(null);
    }
  }, [userId, selectedAccount?.id, refetchTrigger]);

  // Initial account fetching
  useEffect(() => {
    const fetchAccounts = async () => {
      const currentUserId = userId != null ? userId : 'USER_ID_HERE'; // Replace with session/auth ID if available
      if (userId == null) setUserId(currentUserId);

      // console.log('User ID: ', userId, currentUserId);
      
      try {
        const result = await getAccounts(currentUserId);

        if (result.status !== HttpStatus.OK) {
          throw new Error(result.error!);
        }

        setAccounts(result.data);

        if (result.data && result.data.length > 0) {
          setSelectedAccount(result.data[0]);
          setSelectedAccountPurpose(result.data[0].expenseCateg);
        }
      } catch (error) {
        setAccounts([]);
        ToastError(`A problem occurred. ${(error as Error).message}`);
      }
    };

    fetchAccounts();
  }, []);

  // Fetch expense and income categories for active purpose
  useEffect(() => {
    if (userId != null && selectedAccountPurpose) {
      const fetchExpCategories = async () => {
        try {
          const result = await getCategories(userId, selectedAccountPurpose);
          if (result.status !== HttpStatus.OK) throw new Error(result.error!);
          setCategories(result.data);
        } catch (error) {
          setCategories([]);
          ToastError(`A problem occurred. ${(error as Error).message}`);
        }
      };

      const fetchIncCategories = async () => {
        try {
          const result = await getIncomeCategories(userId, selectedAccountPurpose);
          if (result.status !== HttpStatus.OK) throw new Error(result.error!);
          setIncomeCategories(result.data);
        } catch (error) {
          setIncomeCategories([]);
          ToastError(`A problem occurred. ${(error as Error).message}`);
        }
      };

      fetchExpCategories();
      fetchIncCategories();
    }
  }, [userId, selectedAccountPurpose]);

  // Fetch category lookup maps when active account changes
  useEffect(() => {
    if (userId == null || !selectedAccount?.id) return;

    const makeCategMap = async () => {
      try {
        const result = await getCategoryMap(userId, selectedAccount.id);
        if (result.status !== HttpStatus.OK) throw new Error(result.error!);
        setExpCategoriesMap(result.data);
      } catch (error) {
        ToastError(`There was an issue fetching categories map. ${(error as Error).message}.`);
        setExpCategoriesMap(null);
      }

      try {
        const result = await getCategoryMap(userId, selectedAccount.id, 'income');
        if (result.status !== HttpStatus.OK) throw new Error(result.error!);
        setIncCategoriesMap(result.data);
      } catch (error) {
        ToastError(`There was an issue fetching categories map. ${(error as Error).message}.`);
        setIncCategoriesMap(null);
      }

      try {
        const result = await getCategoryMap(userId, selectedAccount.id, 'all');
        if (result.status !== HttpStatus.OK) throw new Error(result.error!);
        setAllCategoriesMap(result.data);
      } catch (error) {
        ToastError(`There was an issue fetching categories map. ${(error as Error).message}.`);
        setAllCategoriesMap(null);
      }
    };

    makeCategMap();
    if (selectedAccount.expenseCateg) {
      setSelectedAccountPurpose(selectedAccount.expenseCateg);
    }
  }, [selectedAccount, userId]);

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setExtractedData(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId ?? '');
    formData.append('purpose', selectedAccountPurpose);

    const result = await parseReceiptAction(formData);
    let lastestDelta: ExtractedReceipt | null = null;

    if (result && result.success != false && result.data) {
      for await (const delta of readStreamableValue(result.data as any)) {
        if (delta) {
          setExtractedData(delta as ExtractedReceipt);
          lastestDelta = delta as ExtractedReceipt;
        }
      }

      if (lastestDelta) {
        const finalDelta = lastestDelta;
        // console.log('Extract: ', finalDelta);
        setTransactionsEx((prevReceipts) => [...prevReceipts, finalDelta]);
      }
    } else {
      let streamableValue: any[] | ExtractedReceipt | null = null;

      for await (const delta of readStreamableValue(result?.data as any)) {
        if (delta) {
          streamableValue = delta as ExtractedReceipt;
          lastestDelta = delta as ExtractedReceipt;
        }
      }

      if (lastestDelta) {
        const finalDelta = lastestDelta;
        // console.log('Extract: ', finalDelta);
        // setTransactionsEx((prevReceipts) => [...prevReceipts, finalDelta]);
      }
      alert(`Parsing error: Unknown error occurred`);
    }

    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAccountSelect = (val: string | null) => {
    const acc = accounts.find((a) => a.id === val);
    setSelectedAccount(acc);
    if (acc?.expenseCateg) {
      setSelectedAccountPurpose(acc.expenseCateg);
    }
  };

  const handleChangeItemCategory = (categId: string, transIndex: number, itemIndex: number) => {
    try {
      if (!transactionsEx || transactionsEx.length === 0) {
        throw new Error('No extracted transactions were found.');
      }

      if (transIndex < 0 || transIndex >= transactionsEx.length) {
        throw new Error('Invalid transaction index.');
      }

      const selectedCategory = categories.find((c) => c.id === categId);
      if (!selectedCategory) {
        throw new Error('Selected category could not be resolved.');
      }

      setTransactionsEx((prevTransactions) => {
        if (!prevTransactions) return [];

        return prevTransactions.map((tx, currentTransIdx) => {
          if (currentTransIdx !== transIndex) return tx;

          const updatedItems = tx.items.map((item, currentItemIdx) => {
            if (currentItemIdx === itemIndex) {
              return {
                ...item,
                subcategory: categId,
                majorCategory: selectedCategory.parent ?? '',
              };
            }
            return item;
          });

          return {
            ...tx,
            items: updatedItems,
          };
        });
      });
    } catch (error) {
      ToastError(`Attempt to update the category of an item has failed. ${(error as Error).message}.`);
    }
  };

  const handleSaveTransactions = async () => {
    try {
      let transactionsToSave: NewDBTransactions[] = [];
      let transactionsBreakdownToSave: NewDBTransactionBreakdown[] = [];

      transactionsEx.forEach((tEx) => {
        const tId = uuidv4();

        let t: NewDBTransactions = {
          id: tId,
          userId: userId!,
          accountId: selectedAccount?.id!,
          details: tEx.vendorName,
          amount: tEx.items.reduce((acc, item) => acc + item.totalItemPrice, 0).toString(),
          type: tEx.transType,
          category: tEx.transMajorCateg,
          notes: '',
        };

        tEx.items.forEach((item) => {
          let i: NewDBTransactionBreakdown = {
            userId: userId!,
            transactionId: tId,
            details: item.itemName,
            unitPrice: item.unitPrice.toString(),
            quatity: item.quantity,
            totalPrice: (item.unitPrice * item.quantity).toString(),
            category: item.subcategory,
          };

          transactionsBreakdownToSave.push(i);
        });

        transactionsToSave.push(t);
      });

      const insertResults = await saveNewTransactionsAndBreakdowns(
        userId!,
        selectedAccount?.id!,
        transactionsToSave,
        transactionsBreakdownToSave
      );

      if (insertResults.status !== HttpStatus.OK) throw new Error(insertResults.error!);

      setTransactionsEx([]);
      setRefetchTrigger((prev) => prev + 1);
      setSelectedTab('list');
      ToastMessage('New transactions saved successfully...');
    } catch (error) {
      ToastError(`Something went wrong when saving transactions. ${(error as Error).message}.`);
    }
  };

  const handleAppendToTransactionsEx = (unsavedTransaction: ExtractedReceipt) => {
    if (!unsavedTransaction || !unsavedTransaction.items) {
      throw new Error('No transaction data is found or complete.');
    }
    setTransactionsEx((prevReceipts) => [...prevReceipts, unsavedTransaction]);
  };

  const handleCancelGeneratedExtract = () => {
    setTransactionsEx([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col justify-between mb-6 space-y-5">
        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-white dark:text-gray-100">
            Ledger Matrix
          </h1>
        </div>
        <p className="text-white dark:text-gray-400">
          Structured repository of statements and automatic receipt extraction logs.
        </p>
      </div>

      <div className="w-full rounded-xl bg-gray-300 flex flex-col p-4 space-y-3 relative z-10">
        <div className="text-indigo-600 font-bold text-lg flex flex-col">
          <div>Active Account</div>
          <div className="text-sm italic text-gray-500">
            This is the account on which transactions will be posted.
          </div>
        </div>

        <SelectAccount
          selectedAccount={selectedAccount}
          handleAccountSelect={handleAccountSelect}
          accounts={accounts}
        />
      </div>

      <Tabs
        defaultValue="list"
        className="w-full space-y-4 bg-gray-300 rounded-xl"
        value={selectedTab}
        onValueChange={(val) => setSelectedTab(val)}
      >
        <TabsList className="bg-indigo-500 border border-indigo-800 w-full">
          <TabsTrigger
            value="list"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-white"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-white"
          >
            Add Transaction
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Transaction Listing */}
        <TabsContent value="list" className="space-y-4">
          {!selectedAccount ? (
            <div className="p-8 text-center text-gray-600 font-medium italic bg-gray-200 rounded-xl">
              Please select an active account above to view transactions.
            </div>
          ) : transactionsPromise ? (
            <Suspense key={`${selectedAccount?.id}-${refetchTrigger}`} fallback={<FetchingTransactions />}>
              <TransactionsList
                transactionsPromise={transactionsPromise}
                userId={userId}
                categoriesMap={allCategoriesMap}
              />
            </Suspense>
          ) : (
            <FetchingTransactions />
          )}
        </TabsContent>

        {/* Tab 2: Upload / Receipt Extraction */}
        <TabsContent value="add" className="space-y-6 p-2">
          <TransactionsInputsBlock
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleZoneClick={handleZoneClick}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            isUploading={isUploading}
            isDragActive={isDragActive}
            userId={userId}
            selectedAccount={selectedAccount}
            expCategoriesMap={expCategoriesMap}
            incCategoriesMap={incCategoriesMap}
            extractedData={extractedData}
            setExtractedData={setExtractedData}
            handleAppendToTransactionsEx={handleAppendToTransactionsEx}
          />

          {/* Dynamic AI Verification Sandbox */}
          <NewTransactionsList
            extractedData={extractedData}
            expCategories={categories}
            incCategories={incomeCategories}
            unsavedTransactions={transactionsEx}
            onValueChange={handleChangeItemCategory}
          />

          {transactionsEx && transactionsEx.length > 0 ? (
            <div className="w-full flex justify-end items-end gap-3">
              <div>
                <Button
                  variant={"destructive"}
                  className={"w-30"}
                  onClick={handleCancelGeneratedExtract}
                >
                  Cancel
                </Button>
              </div>

              <div>
                <Button
                  variant={"default"}
                  className={"w-30"}
                  onClick={handleSaveTransactions}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}