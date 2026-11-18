import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

function TransactionsFilter() {
  const [ filterType, setFilterType ] = useState<string>('Cycle');
  const [ dateFrom, setDDateFrom ] = useState<string>();
  const [ dateTo, setDDateTo ] = useState<string>();

  return (
    <div className='w-full pt-4 pb-4 pl-4 pr-4 flex gap-4 text-white items-center'>
        <Label className='font-bold'>Filter:</Label>
        <Select value={filterType} onValueChange={(val) => setFilterType(val as string)}>
            <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 w-[30%]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="Cycle" className="focus:bg-slate-800 focus:text-rose-400 font-mono">
                  Cycle
                </SelectItem>
                <SelectItem value="Date Range" className="focus:bg-slate-800 focus:text-emerald-400 font-mono">
                  Date Range
                </SelectItem>
            </SelectContent>
        </Select>
        <div className='p-2 border-2 border-gray-500 rounded-md w-full flex items-center gap-4'>
          {
            filterType == 'Cycle' ? (<Label>Cycle</Label>) : (
              <>
                <Label>Date From:</Label>
                <input
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(e) => setDDateFrom(e.target.value)}
                  className="w-[25%] bg-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-emerald-500 font-mono"
                />

                <Label>Date To:</Label>
                <input
                  type="datetime-local"
                  value={dateTo}
                  onChange={(e) => setDDateTo(e.target.value)}
                  className="w-[25%] bg-slate-300 border border-slate-800 rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-emerald-500 font-mono"
                />
              </>
            )
          }
        </div>
    </div>
  )
}

export default TransactionsFilter