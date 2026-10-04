import {
  LayoutDashboard,
  Receipt,
  PieChart,
  BarChart3,
  CalendarDays,
  Settings,
  TrendingUp,
  TrendingDown,
  Building2,
  Bot
} from 'lucide-react';
import { NavItem } from './interface';

export const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Recurring Bills', href: '/recurring', icon: CalendarDays },
  {
    name: 'Settings',
    icon: Settings,
    subItems: [
      { name: 'Accounts', href: '/settings/accounts', icon: Building2 },
      { name: 'Income Categories', href: '/settings/incomeCategoriesEx', icon: TrendingUp },
      { name: 'Expense Categories', href: '/settings/expenseCategories', icon: TrendingDown },
      { name: 'Budgets', href: '/budgets', icon: PieChart },
      { name: 'AI Avatar Settings', href: '/settings/aiAvatarSettings', icon: Bot },
    ],
  },
];