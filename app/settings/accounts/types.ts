import {
  Wallet,
  Building2,
  Banknote,
  CreditCard,  
  HandCoins,
} from 'lucide-react';

export const ACCOUNT_TYPES = [
    { value: 'checking', label: 'Current / Checking', icon: Building2 },
    { value: 'savings', label: 'Savings Account', icon: Wallet },
    { value: 'cash', label: 'Cash Wallet', icon: Banknote },
    { value: 'credit', label: 'Credit Card', icon: CreditCard },
    { value: 'loan', label: 'Loan / Liability', icon: HandCoins },
];

