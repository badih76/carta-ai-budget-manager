import { UAIExpenseCategory } from "@/app/settings/expenseCategories/categoriesListSchema";
import { UAIIncomeCategory } from "@/app/settings/incomeCategoriesEx/categoriesListSchema";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SortOrder = 'asc' | 'desc';

export function sortExpenseCategories(
  categories: UAIExpenseCategory[],
  order: SortOrder = 'asc'
): UAIExpenseCategory[] {
  return [...categories].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, undefined, {
      sensitivity: 'base',
      numeric: true,
    });
    return order === 'asc' ? comparison : -comparison;
  });
}

export function sortIncomeCategories(
  categories: UAIIncomeCategory[],
  order: SortOrder = 'asc'
): UAIIncomeCategory[] {
  return [...categories].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, undefined, {
      sensitivity: 'base',
      numeric: true,
    });
    return order === 'asc' ? comparison : -comparison;
  });
}

export const returnSortedStreamedCategoriesList = (prev: UAIExpenseCategory[], validatedList: UAIExpenseCategory[]) => {
  // 1. Index previous items by name (lowercased) or ID
    const categoryMap = new Map<string, UAIExpenseCategory>();

    for (const item of prev) {
      const key = item.id || item.name.trim().toLowerCase();
      categoryMap.set(key, item);
    }

    // 2. Merge/Overwrite with incoming streamed items
    for (const incoming of validatedList) {
      if (!incoming.name) continue;

      const key = incoming.id || incoming.name.trim().toLowerCase();
      const existing = categoryMap.get(key);

      // Merge incoming properties onto existing object so partial fields update seamlessly
      categoryMap.set(key, {
        ...existing,
        ...incoming,
        id: incoming.id || existing?.id || '',
        isSaved: false,
      });
    }

    // 3. Convert back to array and sort
    return sortExpenseCategories(Array.from(categoryMap.values()), 'asc');
}
