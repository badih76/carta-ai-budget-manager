import {
  Wallet,
  Building2,
  Banknote,
  CreditCard,  
  HandCoins,
} from 'lucide-react';

export const getAccountIcon = (typeStr: string) => {
    switch (typeStr) {
        case 'savings':
            return <Wallet className="h-5 w-5 text-emerald-400" />;
        case 'credit':
            return <CreditCard className="h-5 w-5 text-rose-400" />;
        case 'cash':
            return <Banknote className="h-5 w-5 text-amber-400" />;
        case 'loan':
            return <HandCoins className="h-5 w-5 text-indigo-400" />;    
        default:
            return <Building2 className="h-5 w-5 text-blue-400" />;
    }
  };