import React from 'react'
import { AddTransactionDialog } from './addTransactionDialog'
import { DBAccount } from '@/src/drizzle/schema'
import { ExtractedReceipt } from './receiptSchema'

interface ITransactionsInputsBlock {
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    cameraInputRef: React.RefObject<HTMLInputElement | null>, // Added for camera
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement, Element>) => void,
    handleZoneClick: () => void,
    handleCameraClick: () => void, // Added for camera trigger
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
    handleAppendToTransactionsEx: (unsavedTransaction: ExtractedReceipt) => void,
    isMobile: boolean
} 

function TransactionsInputsBlock({ 
    fileInputRef, 
    cameraInputRef, 
    handleFileChange, 
    handleZoneClick, 
    handleCameraClick,
    extractedData, 
    setExtractedData,
    handleDrag, 
    handleDrop, 
    isUploading, 
    isDragActive, 
    userId, 
    selectedAccount, 
    expCategoriesMap, 
    incCategoriesMap,
    handleAppendToTransactionsEx,
    isMobile
}: ITransactionsInputsBlock) {
    return (
        <div className={`w-full grid grid-cols-1 ${isMobile ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 items-stretch`}>
            
            {/* 1. Hidden Native File Input Field (Upload) */}
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
            />

            {/* 2. Hidden Native Camera Input Field (Camera Capture) */}
            <input 
                type="file" 
                ref={cameraInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
            />

            {/* Option A: Functional Drag and Drop + Click Upload Zone */}
            <div 
                onClick={handleZoneClick}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
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

            {/* Option B: Device Camera Capture Zone */}
            {
                isMobile ? (
                    <div 
                        onClick={handleCameraClick}
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        isUploading 
                            ? 'border-emerald-500 bg-emerald-950/10 pointer-events-none animate-pulse' 
                            : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                        }`}
                    >
                        <div className="max-w-xs mx-auto space-y-2">
                            <div className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 mb-2">
                                📷
                            </div>
                            <p className="text-sm font-medium text-white italic">
                                {isUploading ? "Processing captured frame..." : "Take photo with device camera"}
                            </p>
                            <p className="text-xs text-slate-600">
                                Capture physical receipts or invoices instantly using your phone or PC webcam.
                            </p>
                        </div>
                    </div>
                ) : null
            }
            
            {/* Option C: Add Transaction Dialog Box (Manual) */}
            <div 
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                isUploading 
                    ? 'border-emerald-500 bg-emerald-950/10 pointer-events-none animate-pulse' 
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                }`}  
            >
                <div className='w-full space-y-2 mb-2'>
                    <p className='text-white font-bold text-xs uppercase tracking-wider text-slate-400'>Manual Entry</p>
                    <span className='text-white italic text-sm block'>Add individual transaction directly...</span>
                </div>
                <AddTransactionDialog
                    userId={userId!}
                    accountId={selectedAccount?.id!}
                    expCategoryMap={expCategoriesMap!}
                    incCategoryMap={incCategoriesMap!}
                    onSuccess={() => {
                        // Trigger data refresh or state updates if needed
                    }}
                    extractedData={extractedData}
                    setExtractedData={setExtractedData} 
                    handleAppendToTransactionsEx={handleAppendToTransactionsEx}
                />
            </div>
        </div>
    )
}

export default TransactionsInputsBlock;