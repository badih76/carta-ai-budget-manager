'use client';

import React, { useEffect, useState } from 'react';
import BudgetPieChart from './budgetPieChart';
import { DBAccount, DBExpenseBudgets, DBExpenseCategory, expenseCategories, NewDBExpenseBudgets } from '@/src/drizzle/schema';
import { generateBudgetAllocationsStream, getBudgetById, getExpenseBudgets, saveExpenseBudget } from './actions';
import HttpStatus from '@/lib/HttpStatus';
import { ToastError, ToastMessage } from '@/lib/sonnerUtils';
import { getExpenseCategories, getExpensesCategoriesPurposes } from '../settings/expenseCategories/actions';
import { purposeOptions } from '../settings/expenseCategories/types';
import { getAccountById, getAccounts } from '../settings/accounts/actions';
import { TExpenseCategBudget, TRequiredFieldsError } from './types';
import { readStreamableValue } from '@ai-sdk/rsc';
import ControlButtons from './controlButtons';
import BudgetDetails from './budgetDetails';
import HorizontalSeparator from './horizontalSeparator';
import { useUser } from '@clerk/nextjs';

interface BudgetCategory {
  id: string;
  category: string;
  limit: number;
}

const blankAccount: DBAccount = {
  userId: '',
  name: '',
  id: '',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  expenseCateg: '',
  type: '',
  balance: '',
  currency: '',
  incomeCateg: ''
}

const initReqFieldsErrors: TRequiredFieldsError = {
  budgetName: {
    errorMessage: 'The Budget Name is required.',
    visible: false
  },
  account: {
    errorMessage: 'The targetted Account is required.',
    visible: false
  },
  categList: {
    errorMessage: 'The Expense Categories List is required.',
    visible: false
  },
  initAllocation: {
    errorMessage: 'The Initial Allocation Amount is required.',
    visible: false
  },
}

export default function BudgetsPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  const [savedBudgets, setSavedBudgets] = useState<BudgetCategory[] | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState('b_1');
  const [isAllocating, setIsAllocating] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Modal / Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newInitialLimit, setNewInitialLimit] = useState('');

  const [ userId, setUserId ] = useState<string | null>(null);
  // const [ expenseCategories, setExpenseCategories ] = useState<DBExpenseCategory[]>([]);
  const [ expenseBudgets, setExpenseBudgets ] = useState<DBExpenseBudgets[]>([]);
  const [ selectedBudget, setSelectedBudget ] = useState<DBExpenseBudgets | null>();
  const [ expenseCategoryLists, setExpenseCategoryLists ] = useState<{ purpose: string }[]>([]);
  const [ selectedCategoryList, setSelectedCategoryList ] = useState<string>('');
  const [ accounts, setAccounts ] = useState<DBAccount[]>([]);
  const [ selectedAccount, setSelectedAccount ] = useState<DBAccount>(blankAccount);
  const [ requiredFieldsError, setRequiredFieldsErrors ] = useState<TRequiredFieldsError>(initReqFieldsErrors);
  const [ budgetedCategories, setBudgetedCategories ] = useState<TExpenseCategBudget[]>([]);
  const [ reasonings, setReasonings ] = useState<Record<string, string>>({});
  const [ expCategories, setExpCategories ] = useState<DBExpenseCategory[]>([]);
  const [ accountsFetched, setAccountsFetched ] = useState<boolean>(false);

  // Derived Totals
  const totalBudgeted = budgetedCategories.reduce((sum, item) => sum + (item.limit || 0), 0);
  const remainingAllowance = (selectedBudget ? parseFloat(selectedBudget.initAllocatedAmount) : 0) - totalBudgeted;

  useEffect(() => {
    if(isLoaded && isSignedIn)
      setUserId(user.id);
  }, [ isLoaded ]);

  useEffect(() => {
    if(!userId || !isSignedIn) return;

    const fetchExpenseBudgets = async () => {
      try {
        const results = await getExpenseBudgets(userId!);

        if(results.status != HttpStatus.OK)
          throw new Error(results.error!);

        if(results.data.length > 0) {
          setExpenseBudgets(results.data);

          setSelectedBudget(results.data[0]);

          const acc = await getAccountById((results.data[0] as DBExpenseBudgets).accountId);

          if(acc.status != HttpStatus.OK)
            throw new Error(acc.error!);

          if(acc.data.length > 0)
            setSelectedAccount(acc.data[0]);
          
          try {
            const categ: TExpenseCategBudget[] = JSON.parse((results.data[0] as DBExpenseBudgets).breakdown!);

            setBudgetedCategories(categ);

          } catch(error) {
            setBudgetedCategories([]);
          }
        }

      } catch(error) {
        // console.log('fetchExpenseBudgets: ', (error as Error).message);
        ToastError(`There was a problem fetching the saved budgets. ${(error as Error).message}.`);
        setExpenseBudgets([]);
        setSelectedBudget(null)
      }

    }

    fetchExpenseBudgets();

    const fetchCategLists = async () => {
      try {
        const results = await getExpensesCategoriesPurposes(userId!);

        if(results.status != HttpStatus.OK)
          throw new Error(results.error!);

        setExpenseCategoryLists([{ purpose: '' }, ...results.data]);

        if(results.data.length > 0) 
          setSelectedCategoryList('');       

      } catch(error) {
        // console.log('fetchCategLists: ', (error as Error).message);
        ToastError(`There was a problem fetching the saved expense category lists. ${(error as Error).message}.`);
        setExpenseCategoryLists([]);
        setSelectedCategoryList('');
      }
    }

    fetchCategLists();

    const fetchAccounts = async () => {
      setAccountsFetched(false);
      try {
        const results = await getAccounts(userId!);

        if(results.status != HttpStatus.OK)
          throw new Error(results.error!);
        
        const accounts: DBAccount[] = [blankAccount, ...results.data];

        setAccounts(accounts);

        if(results.data.length > 0)
          setSelectedAccount(accounts[0]);

      } catch(error) {
        // console.log('fetchAccounts: ', (error as Error).message);
        ToastError(`There was a problem fetching the saved accoounts. ${(error as Error).message}.`);
        setAccounts([]);
      }

      setAccountsFetched(true);
    }

    fetchAccounts();

  }, [ userId ]);

  useEffect(() => {
    const fetchCategs = async () => {
      try {
        const results = await getExpenseCategories(userId!, selectedAccount.expenseCateg);

        if(results.status != HttpStatus.OK)
          throw new Error(results.error!);

        setExpCategories(results.data);

      } catch(error) {
        // console.log('fetchCategs: ', (error as Error).message);
        ToastError(`There was a problem fetching the saved expense category lists. ${(error as Error).message}.`);
        setExpCategories([]);          
      }
    }

    fetchCategs();
  }, [ selectedAccount ]);

  // Sync Input and Slider Changes
  const handleLimitChange = (id: string, value: number) => {
    const safeVal = isNaN(value) ? 0 : Math.max(0, value);
    setBudgetedCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, limit: safeVal } : item))
    );

    setIsSavedNotice(false);
  };

  // 1. Generate Budget based on Payroll Cycle Allocation
  const triggerSmartAllocation = async () => {
    if (!budgetedCategories || budgetedCategories.length === 0 || parseFloat(selectedBudget?.initAllocatedAmount!) <= 0) return;

    setIsAllocating(true);
    setIsSavedNotice(false);
    try {
      // Call the Server Action
      const { output } = await generateBudgetAllocationsStream(budgetedCategories, parseFloat(selectedBudget?.initAllocatedAmount!));

      // Stream the live response chunks
      for await (const chunk of readStreamableValue(output)) {
        if (chunk?.allocations && Array.isArray(chunk.allocations)) {
          // Map streaming allocations back to existing category array shape
          const updatedCategories = budgetedCategories.map((cat) => {
            const streamedMatch = chunk.allocations?.find((a: any) => a?.id === cat.id);
            return {
              ...cat,
              limit: streamedMatch?.limit ?? cat.limit ?? 0,
            };
          });

          // Store reasonings if available
          const newReasonings: Record<string, string> = {};
          chunk.allocations.forEach((a: any) => {
            if (a?.id && a?.reasoning) {
              newReasonings[a.id] = a.reasoning;
            }
          });
          setReasonings(newReasonings);

          // Update parent state in real-time as stream flows
          setBudgetedCategories(updatedCategories);
        }
      }
    } catch (error) {
      console.error('Error auto-generating budget:', error);
    } finally {
      setIsAllocating(false);
    }
  };

  // 3. Reset Budget
  const handleReset = () => {
    if (savedBudgets) {
      setBudgetedCategories(JSON.parse(JSON.stringify(savedBudgets)));
    } else {
      setBudgetedCategories((prev) => prev.map((item) => ({ ...item, limit: 0 })));
    }
  };

  // 4. Handle Adding New Budget Entry from Dialog
  const handleAddBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!newCategory) return;

    // check if all required fields are filled...
    let reqFieldsErr = {...requiredFieldsError};

    reqFieldsErr.budgetName.visible = !newBudgetName || newBudgetName.trim() === '';
    reqFieldsErr.account.visible = !selectedAccount || selectedAccount.id.trim() === '';
    reqFieldsErr.categList.visible = !selectedCategoryList || selectedCategoryList === '';
    reqFieldsErr.initAllocation.visible = !newInitialLimit || newInitialLimit.trim() === '';

    let expenseBudget: NewDBExpenseBudgets = {
      name: newBudgetName,
      userId: userId!,
      expenseCateg: selectedCategoryList,
      accountId: selectedAccount.id,
      initAllocatedAmount: newInitialLimit
    }

    try {
      const results = await saveExpenseBudget(expenseBudget, true);

      if(results.status != HttpStatus.OK)
        throw new Error(results.error!);

      setSelectedBudget(results.data[0]);
      setExpenseBudgets((prev) => [...prev, results.data[0]]);

      const expCategs: TExpenseCategBudget[] = JSON.parse((results.data[0] as DBExpenseBudgets).breakdown!);
      setBudgetedCategories(expCategs);

    } catch(error) {
      // console.log('handleAddBudgetSubmit: ', (error as Error).message);
      ToastError(`There was a problem. ${(error as Error).message}.`);
      console.error(error);
    }
    
    setIsDialogOpen(false);
  };

  const handleAccountChange = (val: string) => {
    setSelectedAccount(accounts.find(a => a.id == val)!);
    setSelectedCategoryList(accounts.find(a => a.id == val)?.expenseCateg!);
  }

  const handleOnDialogOpen = () => {
    setNewBudgetName('');
    setSelectedAccount(blankAccount);
    setSelectedCategoryList('');
    setNewInitialLimit('0.00');
    setIsDialogOpen(true);
  }

  const handlePullCategoriesChange = async () => {
    let expCateg = [...budgetedCategories];

    try {
      // get the list of latest categories for the selected category list
      const results = await getExpenseCategories(userId!, selectedAccount.expenseCateg);

      if(results.status != HttpStatus.OK)
        throw new Error(results.error!);
      
      // save the expense categories
      // setExpenseCategories(results.data as DBExpenseCategory[]);

      (results.data as DBExpenseCategory[]).map((c: DBExpenseCategory) => {
        const i = expCateg.findIndex((ec: TExpenseCategBudget) => ec.category == c.id);

        if(i == -1) {
          const ec: TExpenseCategBudget = {
            id: c.id,
            category: c.id,
            limit: 0,
            description: c.description,
            examples: c.examples!
          }

          expCateg.push(ec);
        }
      })

      setBudgetedCategories(expCateg);

    } catch(error) {
      // console.log('handlePullCategoriesChange: ', (error as Error).message);
      ToastError(`There was a problem pulling latest expense categories. ${(error as Error).message}.`);

    }
  }

  const handleResetBudgetedCategories = async () => {
    setIsAllocating(true);

    try {
      const results = await getBudgetById(selectedBudget?.id!);

      if(results.status != HttpStatus.OK)
        throw new Error(results.error!);

      if(results.data.length == 0) {
        setIsAllocating(false);
        return;
      }

      const breakdown = (results.data[0] as DBExpenseBudgets).breakdown;

      // 1. Check breakdown type and if null...
      if(typeof breakdown !== 'string' || !breakdown) {
        setIsAllocating(false); 
        return;
      }

      // 2. if breakdown is not null and is a string, parse the stringified array...
      const budgCateg = JSON.parse(breakdown);

      if (!Array.isArray(budgCateg)) {
        // console.warn('Expected breakdown to be an array, but received:', typeof budgCateg);
        throw new Error(`Expected breakdown to be an array, but received: ${typeof budgCateg}.`);
      }

      setBudgetedCategories(budgCateg);
      setIsAllocating(false);
      
    } catch(error) {
      // console.log('handleResetBudgetedCategories: ', (error as Error).message);
      ToastError(`There was a problem resetting to saved budgeted expense categories. ${(error as Error).message}.`);
      setIsAllocating(false);
    }   
  }

  const handleSaveBudget = async () => {
    setIsAllocating(true);

    try {
      const stringifiedBreakdown = JSON.stringify(budgetedCategories);

      const budget: DBExpenseBudgets = {...selectedBudget!, breakdown: stringifiedBreakdown};

      const results = await saveExpenseBudget(budget);

      if(results.status != HttpStatus.OK)
        throw new Error(results.error!);

      ToastMessage('Budgeted Categories Saved Successfully.');
      setIsSavedNotice(true);

    } catch(error) {
      // console.log('handleSaveBudget: ', (error as Error).message);
      ToastError(`There was a problem saving budgeted expense categories. ${(error as Error).message}.`);
      
    }

    setIsAllocating(false);
  }

  return (
    <div className="space-y-6">
      {/* Title, Description & Top Selection Controls */}
      {/* <div className="flex flex-col md:flex-row md:items-end justify-between gap-4"> */}
        {/* Title & Description */}
        <div className='space-y-5'>
          <h1 className="text-3xl font-bold tracking-tight text-white">Expenditure Budgets</h1>
          <p className="text-sm text-white">
            Create category-based spending targets to manage and guide expenditure across your selected accounts for this payroll cycle.
          </p>
        </div>

        {/* Full-Width Saved Budget Selector Panel & Action */}
        <div className="w-full space-y-3">
          {/* Select Panel Div */}
          <div className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <label 
              htmlFor="saved-budget-select" 
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Select Saved Budget{'  '}
              {!expenseBudgets || expenseBudgets.length === 0 ? (
                <span className="text-yellow-500 text-[9px]">(No Saved Budgets Found)</span>
              ) : null}
            </label>
            <select
              id="saved-budget-select"
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
            >
              {expenseBudgets && expenseBudgets.length > 0 ?
                  expenseBudgets.map((preset) => (
                  <option key={preset.id} value={preset.id} className="bg-slate-900 text-slate-200">
                    {preset.name}
                  </option>
                ))
                : null
              }
            </select>
          </div>

          <div className="relative flex items-center justify-center my-6">
            {/* Left Half Line */}
            <div className="flex-grow border-t border-slate-800" />
            
            {/* Middle Text */}
            <span className="px-3 text-sm uppercase tracking-wider text-slate-200 font-medium select-none">
              or
            </span>
            
            {/* Right Half Line */}
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Full Width Add New Budget Button */}
          <button
            onClick={() => handleOnDialogOpen()}
            disabled={!accountsFetched || accounts.length == 1}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-lg transition-all shadow-md cursor-pointer text-center"
          >
            { 
              !accountsFetched 
                ? <span className='italic text-slate-400'>fetching accounts...</span> 
                : accountsFetched && accounts.length == 1
                  ? <>
                      <p className='italic text-red-200'>No accounts created to select from.</p> 
                      <p className='italic text-red-200'>Please, create an account to add budget to.</p> 
                    </>
                  : <span>+ Add New Budget</span>
            } 
          </button>
        </div>
      {/* </div> */}

      <HorizontalSeparator />

      {
        selectedBudget ? (
          <>
          <ControlButtons 
            triggerSmartAllocation={triggerSmartAllocation} 
            isAllocating={isAllocating} 
            handleReset={handleReset} 
            savedBudgets={savedBudgets} 
            isSavedNotice={isSavedNotice} 
            handlePullCategoriesChange={handlePullCategoriesChange}
            handleResetBudgetedCategories={handleResetBudgetedCategories}
            handleSaveBudget={handleSaveBudget}
          />

          <BudgetDetails selectedBudget={selectedBudget} totalBudgeted={totalBudgeted} 
            budgetedCategories={budgetedCategories} remainingAllowance={remainingAllowance} 
          />

          {/* List of Expense Categories with Input + Slide Bar */}
          <div className="grid gap-4 md:grid-cols-2">
            {budgetedCategories.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">{                   
                    expCategories.find(c => c.id == b.category)?.name 
                  }</h3>

                  {/* Direct Entry Textbox */}
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={b.limit === 0 ? '' : b.limit}
                      placeholder="0.00"
                      onChange={(e) => handleLimitChange(b.id, parseFloat(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-right text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Slide Bar */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min="0"
                    max={parseFloat(selectedBudget.initAllocatedAmount)}
                    step="10"
                    value={b.limit}
                    onChange={(e) => handleLimitChange(b.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>$0</span>
                    <span>${parseFloat(selectedBudget.initAllocatedAmount).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Isolated Pie Chart Component */}
          <BudgetPieChart budgets={budgetedCategories} />
          </>
         ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex justify-center items-center">
            <div>
              <span className='text-slate-400 italic'>No expense budget is selected.</span>
            </div>
          </div>
         )
      }

      {/* Add New Budget Dialog Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Add New Budget Target</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBudgetSubmit} className="space-y-4">
              {/* Budget Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Budget Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortnightly Household Budget"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <div className={!requiredFieldsError.budgetName.visible ? 'hidden' : ''}>
                  {requiredFieldsError.budgetName.errorMessage}
                </div>
              </div>

              {/* Target Account */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Applied Account</label>
                <select
                  value={selectedAccount?.id}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {accounts && accounts.length > 0 ? accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-slate-900 text-slate-200">
                      {acc.name}
                    </option>
                  )) : null}
                </select>
              </div>

              {/* Expense Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Expense Category List</label>
                <select
                  value={selectedCategoryList}
                  required
                  onChange={(e) => setSelectedCategoryList(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {expenseCategoryLists && expenseCategoryLists.length > 0 ? expenseCategoryLists.map((cat, index: number) => {
                    return (<option key={cat.purpose} value={cat.purpose} className="bg-slate-900 text-slate-200">
                      {purposeOptions.find(c => c.key == cat.purpose)?.label}
                    </option>)
                  }) : null}
                </select>
              </div>              

              {/* Initial Budget Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Initial Allocation ($)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  placeholder="0.00"
                  required
                  value={newInitialLimit}
                  onChange={(e) => setNewInitialLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm rounded-lg transition-all shadow-md cursor-pointer"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}