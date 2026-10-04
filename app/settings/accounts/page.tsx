'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createAccount, getAccounts, updateAccount } from './actions';
import { DBAccount } from '@/src/drizzle/schema';
import {
  Plus,
  Pencil,
} from 'lucide-react';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ACCOUNT_TYPES } from './types';
import { getAccountIcon } from './getAccountIcon';
import HttpStatus from '@/lib/HttpStatus';
import { ToastError, ToastMessage } from '@/lib/sonnerUtils';
import { getExpensesCategoriesPurposes } from '../expenseCategories/actions';
import { purposeOptions } from '../expenseCategories/types';
import { getIncomeCategoriesPurposes } from '../incomeCategoriesEx/actions';
import AccountCardGrid from './accountCardGrid';
import { useUser } from '@clerk/nextjs';


export default function AccountsPage(): React.ReactElement {
  const { user, isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DBAccount | null>(null);
  const [ accounts, setAccounts ] = useState<DBAccount[]>([]);
  const [ expenseCategoriesPurposes, setExpenseCategoriesPurposes ] = useState<string[]>([]);
  const [ incomeCategoriesPurposes, setIncomeCategoriesPurposes ] = useState<string[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [balance, setBalance] = useState('');
  const [description, setDescription] = useState('');
  const [ editingAccoountIndex, setEditingAccountIndex ] = useState<number | null>(null);
  const [ selectedExpensesPurpose, setSelectedExpensesPurpose ] = useState<string>('');
  const [ selectedIncomePurpose, setSelectedIncomePurpose ] = useState<string>('');

  const [ userId, setUserId ] = useState<string | null>(null);

  useEffect(() => {
    if(isLoaded && isSignedIn)
      setUserId(user.id);
  }, [ isLoaded ]);

  useEffect(() => {
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

    if(userId && userId != '') fetchAccounts();

    const fetchExpenseCategoriesPurposes = async () => {
        let purposeList: string[] = [];

        try {
            const results = await getExpensesCategoriesPurposes(userId!);
            
            if(results.status != HttpStatus.OK)
                throw new Error(results.error!);

            if(results.data && results.data.length > 0) {
                results.data.map((p: any)  => {
                    purposeList.push(p.purpose);
                })
            }
            
        } catch(error) {
            console.error((error as Error).message);

        }

        setExpenseCategoriesPurposes(purposeList);
    
    }

    if(userId && userId != '') fetchExpenseCategoriesPurposes();

    const fetchIncomeCategoriesPurposes = async () => {
        let purposeList: string[] = [];

        try {
            const results = await getIncomeCategoriesPurposes(userId!);
            
            if(results.status != HttpStatus.OK)
                throw new Error(results.error!);

            if(results.data && results.data.length > 0) {
                results.data.map((p: any)  => {
                    purposeList.push(p.purpose);
                })
            }
            
        } catch(error) {
            console.error((error as Error).message);

        }

        setIncomeCategoriesPurposes(purposeList);
    
    }
    
    if(userId && userId != '') fetchIncomeCategoriesPurposes();

  }, [ userId ])

  useEffect(() => {
    console.log("expenseCategoriesPurposes: ", expenseCategoriesPurposes);
    console.log("incomeCategoriesPurposes: ", incomeCategoriesPurposes);
    if(expenseCategoriesPurposes.length > 0) setSelectedExpensesPurpose(expenseCategoriesPurposes[0]);
    if(incomeCategoriesPurposes.length > 0) setSelectedIncomePurpose(incomeCategoriesPurposes[0]);

  }, [ expenseCategoriesPurposes, incomeCategoriesPurposes ])

  const resetForm = () => {
    setName('');
    setBalance('');
    setDescription('');
    setType('checking');
    setEditingAccount(null);
  };

  const handleOpenEdit = (acc: DBAccount, index: number) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance);
    setDescription(acc.description || '');
    setSelectedIncomePurpose(acc.incomeCateg);
    setSelectedExpensesPurpose(acc.expenseCateg);
    setEditingAccountIndex(index);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Account name is required');
      return;
    }

    setLoading(true);
    // const userId = ''; // Replace with active session ID

    if (editingAccount) {
      // Update action
      const result = await updateAccount(editingAccount.id, userId!, {
        name,
        type,
        balance: balance || '0.00',
        description,
      });

      const tempAcc: DBAccount[] = [...accounts];
      tempAcc[editingAccoountIndex!] = {...tempAcc[editingAccoountIndex!], 
        name: name, type: type, balance: balance, description: description, 
        expenseCateg: selectedExpensesPurpose, incomeCateg: selectedIncomePurpose
      };

      setAccounts(tempAcc);

      setLoading(false);

      if (result.success) {
        toast.success(`Account "${name}" updated!`);
        setOpen(false);
        resetForm();
      } else {
        toast.error('Failed to update account', {
          description: result.error || 'Database update failed.',
        });
      }
    } else {
      // Create action
      const result = await createAccount({
        userId: userId!,
        name,
        type,
        balance: balance || '0.00',
        description,
      });

      setLoading(false);

      if (result.status == HttpStatus.OK) {
        ToastMessage(`Account "${name}" created!`)
        setOpen(false);
        resetForm();

        const newAcc: DBAccount = {
            id: result.data.id,
            name: name,
            userId: userId!,
            type: type,
            expenseCateg: selectedExpensesPurpose,
            incomeCateg: selectedIncomePurpose,
            balance: balance,
            currency: 'USD',
            description: description,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt
        }

        let updatedAccounts: DBAccount[] = [...accounts];
        updatedAccounts.push(newAcc);

        setAccounts(updatedAccounts);
      } else {
        ToastError(`Failed to create account. ${result.error!}`);
      }
    }
  };

  const purposeMap = new Map(
      purposeOptions.map((item) => [item.key, item.label])
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white dark:text-gray-100">
                Accounts Management
            </h1>
            <p className="text-white dark:text-gray-400">
                Establish item taxonomy boundaries using contextual AI profiling models or build your custom metrics grid.
            </p>        
        </div>        
      </div>

      {/* Account Cards Grid */}
      <AccountCardGrid accounts={accounts} handleOpenEdit={handleOpenEdit} getAccountIcon={getAccountIcon} />

      <div className='w-full flex justify-end items-center'>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger>
            <div
                onClick={resetForm}
            //   className="flex justify-center items-center rounded-md pl-2 pr-3 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold h-9 whitespace-nowrap shrink-0"
                className="flex justify-center items-center rounded-full p-2 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold whitespace-nowrap shrink-0"
            >
              <Plus className="w-8 h-8" /> 
              {/* Add Account */}
            </div>
          </DialogTrigger>

          <DialogContent className="bg-slate-800 border-slate-800 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-white text-base">
                {editingAccount ? 'Edit Account Details' : 'Register Financial Destination'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-slate-200">
                  Account Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Everyday Checking, Amex Platinum"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 h-8"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs text-slate-200">
                  Account Type
                </Label>
                <Select value={type} onValueChange={(val) => setType(val as string )}>
                  <SelectTrigger
                    id="type"
                    className="bg-slate-950 border-slate-800 text-xs text-slate-300 h-8 w-60"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-800 text-slate-800 w-50">
                    {ACCOUNT_TYPES.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="text-xs focus:bg-slate-300 focus:text-white!"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex flex-col justify-between items-start'>
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs text-slate-200">
                    Income Category List
                  </Label>
                  <Select value={selectedIncomePurpose} onValueChange={(val) => setSelectedIncomePurpose(val as string)}>
                    <SelectTrigger
                      id="incomePurpose"
                      className="bg-slate-950 border-slate-800 text-xs text-slate-300 h-8 w-60"
                    >
                      <SelectValue placeholder="Select categories list" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-800 text-slate-800 w-50">
                      {incomeCategoriesPurposes.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          className="text-xs focus:bg-slate-300 focus:text-white!"
                        >
                          <div className="flex items-center gap-2">
                            <span>{purposeMap.get(item)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs text-slate-200">
                    Expenses Category List
                  </Label>
                  <Select value={selectedExpensesPurpose} onValueChange={(val) => setSelectedExpensesPurpose(val as string )}>
                    <SelectTrigger
                      id="expensePurpose"
                      className="bg-slate-950 border-slate-800 text-xs text-slate-300 h-8 w-60"
                    >
                      <SelectValue placeholder="Select categories list" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-white border-slate-800 text-slate-800 w-50"
                      side="bottom" sideOffset={4}
                    >
                      {expenseCategoriesPurposes.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          className="text-xs focus:bg-slate-300 focus:text-white!"
                        >
                          <div className="flex items-center gap-2">
                            <span>{purposeMap.get(item)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="balance" className="text-xs text-slate-200">
                  Opening Balance ($)
                </Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 h-8"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs text-slate-200">
                  Description / Notes (Optional)
                </Label>
                <Input
                  id="description"
                  placeholder="e.g. Primary salary account"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 h-8"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8"
                >
                  {loading
                    ? 'Saving...'
                    : editingAccount
                    ? 'Update Account'
                    : 'Save Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}