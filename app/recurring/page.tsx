'use client';

import React, { useEffect, useState } from 'react';
import { Plus, X, Calendar, DollarSign, Wallet, Layers, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAccounts } from '../settings/accounts/actions';
import HttpStatus from '@/lib/HttpStatus';
import { DBAccount, DBRecurrExpenses, NewDBRecurrExpenses } from '@/src/drizzle/schema';
import { ToastError, ToastMessage } from '@/lib/sonnerUtils';
import { getExpenseCategories, getExpensesCategoriesPurposes } from '../settings/expenseCategories/actions';
import { AFrequencies, TExpenseCategList } from './types';
import { addRecurringExpenses, getRecurringExpenses } from './actions';

export default function RecurringPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [serviceName, setServiceName] = useState('');
  const [cost, setCost] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [customDays, setCustomDays] = useState('0');
  const [selectedAccount, setSelectedAccount] = useState('');
  // const [selectedExpenseList, setSelectedExpenseList] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [ accounts, setAccounts ] = useState<DBAccount[]>([]);
  const [ expenseCategList, setExpenseCategList ] = useState<TExpenseCategList[]>([]);

  const [ userId, setUserId ] = useState<string | null>('');

  // Initial mock recurring list
  const [recurringCharges, setRecurringCharges] = useState<DBRecurrExpenses[]>([]);

  useEffect(() => {
    const fetchRecurrExp = async () => {
      try {
        const results = await getRecurringExpenses(userId!);
  
        if(results.status != HttpStatus.OK)
          throw new Error(results.error!);
  
        setRecurringCharges(results.data);

      } catch(error) {
        setRecurringCharges([]);
        ToastError(`Problem fetching recurring expenses. ${(error as Error).message}.`);
      }
    }

    fetchRecurrExp();

    // Get the accounts related to this user
    const fetchAccounts = async () => {
      try {
          const result = await getAccounts(userId!);
  
          if(result.status != HttpStatus.OK) 
              throw new Error(result.error!);
  
          setAccounts(result.data);

      } catch(error) {
          setAccounts([]);

          ToastError(`A problem occured. ${(error as Error).message}`);
      }
    }

    fetchAccounts();
  }, []);

  const handleAccountSelect = async (accId: string) => {
    // console.log(accounts.find(acc => acc.id = accId)?.expenseCateg);
    const expenseCateg = accounts.find(acc => acc.id == accId)?.expenseCateg;

    try {
      const results = await getExpenseCategories('', expenseCateg!);

      if(results.status != HttpStatus.OK) 
        throw new Error(results.error!);

      const ecList: TExpenseCategList[] = results.data.map((el: any) =>  { 
        let newEC: TExpenseCategList = {
          id: el.id,
          name: el.name
        }

        return newEC;  
      });

      setExpenseCategList(ecList);

      console.log('Expense Category List: ', expenseCategList);
    } catch(error) {
      ToastError(`There was a problem fetching the related expense categories. ${(error as Error).message}.`);
      setExpenseCategList([]);
    }
  }

  // const handleExpenseListChange = (listId: string) => {
  //   setSelectedExpenseList(listId);
  //   setSelectedCategory(''); // Reset sub-category when parent list changes
  // };

  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();

    // Compute formatted billing string
    const billingText =
      frequency === 'custom'
        ? `Every ${customDays} Days`
        : frequency.charAt(0).toUpperCase() + frequency.slice(1);

    const newCharge: NewDBRecurrExpenses = {
      // id: Date.now().toString(),
      accountId: selectedAccount,
      userId: userId!,
      service: serviceName,
      frequency: billingText,
      cycleDays: parseInt(customDays),
      amount: parseFloat(cost || '0').toFixed(2),
      nextDate: `Day ${dueDay}`,
      comment: 'Active',
      expenseCateg: selectedCategory
    };

    try {
      const results = await addRecurringExpenses(newCharge);

      if(results.status != HttpStatus.OK)
        throw new Error(results.error!);

      console.log('Create ID: ', results.data.newId);

      const newChargeItem: DBRecurrExpenses = {
        id: results.data.newId,
        accountId: selectedAccount,
        userId: userId!,
        service: serviceName,
        frequency: billingText,
        cycleDays: parseInt(customDays),
        amount: `$${parseFloat(cost || '0').toFixed(2)}`,
        nextDate: `Day ${dueDay}`,
        comment: 'Active',
        expenseCateg: selectedCategory
      };

      setRecurringCharges((prev) => [newChargeItem, ...prev]);

      ToastMessage('Recurring Expense saved successfully.');
    } catch(error) {
      ToastError(`Problem saving recurring expense. ${(error as Error).message}.`);
    }

    // Reset Form
    setServiceName('');
    setCost('');
    setDueDay('');
    setFrequency('monthly');
    setCustomDays('0');
    setSelectedAccount('');
    // setSelectedExpenseList('');
    setExpenseCategList([]);
    setSelectedCategory('');
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className='space-y-5'>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Recurring Bills and expenses
          </h1>
          <p className="text-sm text-white">
            Keep track of your fixed monthly expenses and active subscriptions.
          </p>
        </div>

        {/* Add Recurring Commitment Modal Trigger */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <div className="flex justify-center items-center rounded-full p-2 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold whitespace-nowrap shrink-0">
              <Plus className="w-8 h-8" />
            </div>
          </DialogTrigger>

          <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Add Recurring Commitment</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateRecurring} className="space-y-4 py-2">
              {/* Service/Bill Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Expense or Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, AWS Subscription, Office Rent"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Amount & Due Day */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    placeholder="1 - 31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Frequency Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Billing Frequency</label>
                <Select value={frequency} onValueChange={(val) => setFrequency(val as string)}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-sm h-10 w-60">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4} className="bg-white border-slate-800 text-slate-800 w-50">
                    {
                      AFrequencies.map(f => (
                        <SelectItem 
                          key={f} 
                          value={f} 
                          className="text-xs focus:bg-slate-300 focus:text-white!"
                        >
                          {f}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Input for Custom Day Frequency */}
              {frequency === 'custom' && (
                <div className="space-y-1.5 animate-in fade-in-50 duration-200">
                  <label className="text-xs font-semibold text-slate-300">Interval (Number of Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 14 for fortnightly, 90 for quarterly"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              )}

              {/* Target Account Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Payment Account</label>
                <Select value={selectedAccount} onValueChange={(val) => {
                    setSelectedAccount(val as string);
                    handleAccountSelect(val as string);
                    console.log('Acc Val: ', val as string);    
                    console.log('Accounts: ', accounts);          
                }}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-sm h-10 w-60">
                    <SelectValue placeholder="Select Account">
                      {accounts.find((acc) => acc.id === selectedAccount) ? accounts.find((acc) => acc.id === selectedAccount)?.name : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4} 
                    className="bg-white border-slate-800 text-slate-800 w-50">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}
                        className="text-xs focus:bg-slate-300 focus:text-white!">
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dependent Sub-Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Expense Category</label>
                <Select
                  // disabled={!selectedExpenseList}
                  value={selectedCategory}
                  onValueChange={(val) => setSelectedCategory(val as string)}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-sm h-10 disabled:opacity-40 disabled:cursor-not-allowed w-60">
                    <SelectValue placeholder={'Select Expense Category'}>
                      {expenseCategList.find((acc) => acc.id === selectedCategory) ? expenseCategList.find((acc) => acc.id === selectedCategory)?.name : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={4} 
                    className="bg-white border-slate-800 text-slate-800 w-50">
                    {expenseCategList.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}
                        className="text-xs focus:bg-slate-300 focus:text-white!">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dialog Action Buttons */}
              <DialogFooter className="pt-4 gap-2">
                <DialogClose>
                  <div className="text-slate-400 hover:text-white hover:bg-slate-800">
                    Cancel
                  </div>
                </DialogClose>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold">
                  Save Commitment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List of Recurring Items */}
      <div className="space-y-4">
        {recurringCharges.map((item) => {
          const isWarning = item.comment?.includes('Increased') || item.comment?.includes('Unused');

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                  {item.service.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{item.service}</h3>
                  <p className="text-xs text-slate-300">
                    {item.frequency} • Next renewal: {item.nextDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* AI Insight Tag */}
                <div
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    isWarning
                      ? 'bg-amber-950/40 border border-amber-500/20 text-amber-400'
                      : 'bg-slate-950 border border-slate-800 text-slate-500'
                  }`}
                >
                  ⚡ {item.comment}
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-white font-mono">{item.amount}</p>
                  <button className="text-[11px] text-slate-300 hover:text-red-400 transition-colors underline bg-transparent border-0 p-0 cursor-pointer">
                    Cancel Track
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}