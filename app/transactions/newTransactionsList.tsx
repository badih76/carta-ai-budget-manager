import React, { useEffect, useState } from 'react'
import { ExtractedReceipt } from './receiptSchema';
import { DBExpenseCategory, DBIncomeCategory, expenseCategories, incomeCategories } from '@/src/drizzle/schema';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface INewTransactionsList {
    extractedData: ExtractedReceipt | null,
    expCategories: DBExpenseCategory[],
    incCategories: DBIncomeCategory[],
    onValueChange: (categId: string, transIndex: number, itemIndex: number) => void,
    unsavedTransactions: ExtractedReceipt[]
}

type TCategSelectItem = {
    label: string,
    value: string
}

function NewTransactionsList({ extractedData, expCategories, incCategories, unsavedTransactions, onValueChange }: INewTransactionsList) {
    const [ expCategSelect, setExpCategSelect ] = useState<TCategSelectItem[]>([]);
    const [ incCategSelect, setIncCategSelect ] = useState<TCategSelectItem[]>([]);
    
    useEffect(() => {
        const categSelectItems: TCategSelectItem[] = expCategories.map(({name, id}) => ({label: name, value: id}));
        setExpCategSelect(categSelectItems);

    }, [expCategories]);

    useEffect(() => {
        const incCategSelectItems: TCategSelectItem[] = incCategories.map(({name, id}) => ({label: name, value: id}));
        setIncCategSelect(incCategSelectItems);

    }, [incCategories]);

    const getCategName = (categId: string) => {
        let foundCateg: (DBExpenseCategory | DBIncomeCategory) | null = null;
        let categsAll: any[] = [...expCategories, incCategories];
        
        foundCateg = categsAll.find(c => c.id == categId);

        return foundCateg ? foundCateg.name : "";
    }

    return (
        <>
            {/* {extractedData && ( */}
            {unsavedTransactions && unsavedTransactions.length > 0 ?
                unsavedTransactions.map((extractedData, edIndex: number) => (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/5 p-5 space-y-4" key={edIndex}>
                        <div className="flex flex-col justify-between items-center border-b-2 border-white pb-3">
                            <div>
                                {/* <span className="text-xs font-mono font-bold tracking-wider text-slate-500 block mb-1">AI EXTRACTION SUCCESS</span> */}
                                <h3 className="text-xl font-bold text-indigo-600">{extractedData.vendorName}</h3>
                            </div>
                            <div className="text-right text-sm text-black font-mono flex justify-center items-center gap-3">
                                <div>Date: {extractedData.purchaseDate}</div>
                                <div className={`rounded-full ${extractedData.transType == 'DB' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 flex justify-center items-center`}>
                                    {extractedData.transType}
                                </div>
                                <div>
                                    {getCategName(extractedData.transMajorCateg)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                        {extractedData.items && extractedData.items.length > 0 ? extractedData.items.map((item: any, index: number) => 
                            {
                                return(
                                    <div 
                                        key={index} 
                                        className="grid grid-cols-1 md:grid-cols-12 items-center text-sm bg-slate-900/40 px-3 py-2 rounded-lg border border-slate-800/60 gap-4"
                                    >
                                        {/* Column 1: Item Name & Subcategory (Spans 5 columns) */}
                                        <div className="col-span-1 md:col-span-5 min-w-0">
                                            <p className="font-bold text-white truncate">{`${item.itemName}`}</p>
                                            {/* <div className="text-slate-300 truncate text-xs">
                                                {categories.find(c => c.id == (item.subcategory || item.subcategoryId))?.name || 'Uncategorized'}
                                            </div>                                         */}
                                        </div>                                    

                                        {/* Column 2: Category Select Dropdown (Spans 4 columns) */}
                                        <div className="col-span-1 md:col-span-4 flex justify-center">
                                            <Select 
                                                value={item.subcategory || ''} 
                                                disabled={!item.subcategory}
                                                onValueChange={(val) => onValueChange(val, edIndex, index)}
                                            >
                                                <SelectTrigger className="w-full text-black bg-white">
                                                    <SelectValue placeholder={"Categorizing..."}>
                                                        {expCategories.find(c => c.id == item.subcategory)?.name}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {
                                                            extractedData.transType == 'DB' ?
                                                                expCategSelect.map(c => (
                                                                    <SelectItem key={c.value} value={c.value}>
                                                                        {c.label}
                                                                    </SelectItem>
                                                                )) :
                                                                incCategSelect.map(c => (
                                                                    <SelectItem key={c.value} value={c.value}>
                                                                        {c.label}
                                                                    </SelectItem>
                                                                ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Column 3: Price Calculation (Spans 3 columns, right-aligned) */}
                                        <div className="col-span-1 md:col-span-3 text-right">
                                            <span className="font-mono font-semibold text-slate-300 text-xs sm:text-sm whitespace-nowrap">
                                                {`${item.quantity} × $${item.unitPrice ? item.unitPrice.toFixed(2) : '0.00'} = $${item.totalItemPrice ? item.totalItemPrice.toFixed(2) : '0.00'}`}
                                            </span>
                                        </div>
                                    </div>
                                )
                            }
                        ) : null}
                        </div>
                        <div className='w-full text-right pt-2 border-double border-t-white border-4 border-l-0 border-r-0 border-b-0'>
                            <span className='mr-4 font-bold text-lg text-indigo-600'>Total: ${ extractedData && extractedData.items ? extractedData.items.reduce((acc, item) => acc + item.totalItemPrice, 0) : 0}</span>
                        </div>
                    </div>
                ))
            : null}
        </>
    )
}

export default NewTransactionsList