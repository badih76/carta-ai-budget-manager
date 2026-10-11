import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DBAccount } from '@/src/drizzle/schema'
import React, { useEffect } from 'react'

interface ISelectAccountProps {
    selectedAccount: DBAccount | undefined | null,
    handleAccountSelect: (val: string | null) => void,
    accounts: DBAccount[]
}

function SelectAccount({ selectedAccount, handleAccountSelect, accounts }: ISelectAccountProps) {    
    return (
        <div>
            <Select value={selectedAccount?.id ? String(selectedAccount.id) : ""} 
                onValueChange={(val) => handleAccountSelect(val as string)}>
            <SelectTrigger
                id="accounts"
                className="bg-slate-950 border-slate-800 text-xs text-slate-300 h-8 w-full"
            >
                <SelectValue placeholder="Select account">
                {selectedAccount?.name}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-800 text-slate-800 w-50">
                {accounts.map((item) => (
                <SelectItem
                    key={item.id}
                    value={item.id}
                    className="text-xs focus:bg-slate-300 focus:text-white!"
                >
                    <div className="flex items-center gap-2">
                    <span>{item.name}</span>
                    </div>
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
    )
}

export default SelectAccount