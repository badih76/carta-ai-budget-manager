import React from 'react'
import { AddTransactionDialog } from './addTransactionDialog'
import { DBAccount } from '@/src/drizzle/schema'
import { ExtractedReceipt } from './receiptSchema'

interface ITransactionsInputsBlock {
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement, Element>) => void,
    handleZoneClick: () => void,
    handleDrag: (e: React.DragEvent<Element>) => void,
    handleDrop: (e: React.DragEvent<Element>) => void,
    isUploading: boolean,
    isDragActive: boolean,
    userId: string | null,
    selectedAccount: DBAccount | undefined | null,
    expCategoriesMap: Record<string, string> | null,
    incCategoriesMap: Record<string, string> | null,
    extractedData: ExtractedReceipt | null,
    setExtractedData: (value: ExtractedReceipt | null) => void,
    handleAppendToTransactionsEx: (unsavedTransaction: ExtractedReceipt) => void
}   

function TransactionsInputsBlock({ fileInputRef, handleFileChange, handleZoneClick, extractedData, setExtractedData,
    handleDrag, handleDrop, isUploading, isDragActive, userId, selectedAccount, expCategoriesMap, incCategoriesMap,
    handleAppendToTransactionsEx }: ITransactionsInputsBlock) {
    return (
        <div className='w-full flex gap-4 justify-center items-stretch'>
            {/* Hidden Native File Input Field */}
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
            />

            {/* Functional Drag and Drop + Click Zone */}
            <div 
                onClick={handleZoneClick}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isUploading 
                    ? 'border-emerald-500 bg-emerald-950/10 pointer-events-none animate-pulse' 
                    : isDragActive
                    ? 'border-emerald-400 bg-slate-900/40 scale-[1.01]'
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                }`}
            >
                <div className="max-w-xs mx-auto space-y-2">
                <div className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 mb-2">
                    {isUploading ? '⚡' : '📄'}
                </div>
                <p className="text-sm font-medium text-white italic">
                    {isUploading ? "AI Extraction Engine processing payload..." : "Drop invoice PDFs or receipt images here"}
                </p>
                <p className="text-xs text-slate-600">
                    {isUploading ? "Reading line items, mapping taxes, and identifying merchants." : "Supports JPEG, PNG, and PDF. Autocategorized via background agent."}
                </p>
                </div>
            </div>
            
            {/* Add Transaction Dialog Box */}
            <div 
                className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                isUploading 
                    ? 'border-emerald-500 bg-emerald-950/10 pointer-events-none animate-pulse' 
                    : isDragActive
                    ? 'border-emerald-400 bg-slate-900/40 scale-[1.01]'
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                }`}  
            >
                <div className='w-full space-y-2 mb-2'>
                <p className='text-white font-bold'>OR</p>
                <span className='text-white italic'>Add the individual transaction manually...</span>
                </div>
                <AddTransactionDialog
                    userId={userId!}
                    accountId={selectedAccount?.id!}
                    expCategoryMap={expCategoriesMap!}
                    incCategoryMap={incCategoriesMap!}
                    onSuccess={() => {
                        // Optionally trigger a data refetch or reload
                    } }
                    extractedData={extractedData}
                    setExtractedData={setExtractedData} 
                    handleAppendToTransactionsEx={handleAppendToTransactionsEx}
                />
            </div>
        </div>
    )
}

export default TransactionsInputsBlock;