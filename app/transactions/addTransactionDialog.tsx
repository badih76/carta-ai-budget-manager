// components/AddTransactionDialog.tsx
'use client';

import React, { useState } from 'react';
import { createTransactionAction } from '@/app/transactions/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExtractedReceipt } from './receiptSchema';
import { ToastError } from '@/lib/sonnerUtils';

interface AddTransactionDialogProps {
  userId: string;
  accountId: string;
  expCategoryMap: Record<string, string>; // { "cat_id": "Category Name" }
  incCategoryMap: Record<string, string>; // { "cat_id": "Category Name" }
  onSuccess?: () => void;
  extractedData: ExtractedReceipt | null,
  setExtractedData: (value: ExtractedReceipt | null) => void,
  handleAppendToTransactionsEx: (unsavedTransaction: ExtractedReceipt) => void
}

export function AddTransactionDialog({
  userId,
  accountId,
  expCategoryMap,
  incCategoryMap,
  onSuccess,
  extractedData,
  setExtractedData,
  handleAppendToTransactionsEx
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [unitPrice, setUnitPrice] = useState('');
  const [type, setType] = useState<'DB' | 'CR'>('DB');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [effectDate, setEffectDate] = useState(
    new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm for datetime-local input
  );
  const [ vendorName, setVendorName ] = useState<string>('');
  const [ itemName, setItemName ] = useState<string>('');
  const [ quantity, setQuantity ] = useState<number>(1);
  const [ totalPrice, setTotalPrice ] = useState<string>('');


  const resetForm = () => {
    setType('DB');
    setVendorName('');
    setItemName('');
    setUnitPrice('');
    setQuantity(1);
    setTotalPrice('');
    setType('DB');
    setCategory('');
    setNotes('');
    setEffectDate(new Date().toISOString().slice(0, 16));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitPrice || !accountId || userId == null) return;

    try {
      setIsSubmitting(true);

      const receipt: ExtractedReceipt = {
        transType: type,
        vendorName: vendorName,
        purchaseDate: new Date(effectDate).toDateString(),
        transMajorCateg: category,
        items: [{
          itemName: itemName,
          quantity: quantity,
          unitPrice: parseFloat(unitPrice),
          totalItemPrice: parseFloat(totalPrice),
          subcategory: category,
          majorCategory: ''
        }]
      } 
      
      handleAppendToTransactionsEx(receipt);

      setIsSubmitting(false);

      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch(error) {
      ToastError(`There was an error inserting the new transactions. ${(error as Error).message}.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
          <span className='text-xl font-bold'>+</span> Add Transaction
        </div>
      </DialogTrigger>

      <DialogContent className="bg-slate-700 border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-100">
            Add New Transaction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Type</label>
              <Select value={type} onValueChange={(val) => setType(val as 'DB' | 'CR')}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 h-[38px] w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="DB" className="focus:bg-slate-800 focus:text-rose-400 font-mono">
                    DB (Debit / Expense)
                  </SelectItem>
                  <SelectItem value="CR" className="focus:bg-slate-800 focus:text-emerald-400 font-mono">
                    CR (Credit / Income)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Effective Date</label>
              <input
                type="datetime-local"
                value={effectDate}
                onChange={(e) => setEffectDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Vendor Name</label>
            <input
              type="text"
              placeholder="Vendor Name..."
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Item Name</label>
            <input
              type="text"
              placeholder="Item Name..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Amount & Type Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Unit Price</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => {
                  setUnitPrice(e.target.value);
                  setTotalPrice((parseFloat(e.target.value) * quantity).toString());
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Quantity</label>
              <input
                type="number"
                // step="1"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => {
                  setQuantity(parseInt(e.target.value));
                  setTotalPrice((parseFloat(unitPrice) * parseInt(e.target.value)).toString());
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Unit Price</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={totalPrice}
                // onChange={(e) => setTotalPrice(e.target.value)}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            
          </div>          

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Category</label>
            <Select value={category} onValueChange={(val) => setCategory(val as string)}>
              <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 h-[38px] w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                { 
                  (type == 'DB' && expCategoryMap) || (type == 'CR' && incCategoryMap) ?
                    Object.entries(type == 'DB' ? expCategoryMap : incCategoryMap).map(([id, name]) => (
                      <SelectItem key={id} value={id} className="focus:bg-slate-800 focus:text-white">
                        {name}
                      </SelectItem>
                    ))
                    : null
                }
              </SelectContent>
            </Select>
          </div>

          {/* New Balance & Effective Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            

            
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Notes / Description</label>
            <input
              type="text"
              placeholder="Optional transaction memo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <DialogFooter className="pt-2">
            <div
              
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}