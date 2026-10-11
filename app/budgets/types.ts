export type TRequiredFieldsError = {
  budgetName: {
    errorMessage: string,
    visible: boolean
  },
  account: {
    errorMessage: string,
    visible: boolean
  },
  categList: {
    errorMessage: string,
    visible: boolean
  },
  initAllocation: {
    errorMessage: string,
    visible: boolean
  },
}

export type TExpenseCategBudget = {
  id: string,
  category: string,
  limit: number,
  description: string,
  examples: string,
  reason?: string
}