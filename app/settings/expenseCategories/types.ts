export const purposeOptions = [
    { key: 'personal', label: 'Home & Personal Budget' },
    { key: 'small_business', label: 'Small Business Operations' },
    { key: 'freelance', label: 'Freelance / Sole Trader' },
    { key: 'real_estate', label: 'Real Estate Investment Portfolio' }
];

export interface ICategoryListItem {
    id?: string,
    mainCategory: string,
    subCategory: string, 
    description: string,
    examples: string,
    isSaved: boolean
}

export const purposePrompts: Record<string, string> = {
      personal: `
        A detailed, multi-dimensional family household budget configuration. 
        It must cover absolute essentials (housing, deep utility frameworks, food, healthcare, basic transit), 
        discretionary lifestyle elements (dining out, entertainment, hobby subscriptions), 
        and long-term wealth/safety positions (emergency liquidity reserves, retirement vehicles, educational funds, insurance premiums).
      `,
      small_business: `
        An expansive operational corporate matrix for a growing service or product-focused company. 
        It must encapsulate human resources/payroll, direct cost of goods sold (COGS/inventory procurement), 
        marketing and customer acquisition pipelines, structural overhead (physical workspace lease or remote tooling setups), 
        professional compliance assets (accounting, legal retainers), and tax or capital interest provisions.
      `,
      freelance: `
        A modern, high-efficiency sole-trader and independent consultancy architecture. 
        It must separate professional cloud ecosystems (heavy dev subscriptions, software SaaS pipelines, AI tooling access) 
        from hardware depreciation, client acquisition overhead (ads, dinners, networking events), 
        home-office proportional utilities deductions, continuous professional skill upgrades, and private healthcare/superannuation pools.
      `,
      real_estate: `
        A complete asset management and real estate investment property ledger layout. 
        It must distinctly isolate capital expenditure projects (major structural renovations) from routine physical upkeep (handyman, landscaping), 
        property management agency commissions, loan portfolio structural parameters (interest adjustments vs. principal payments), 
        local council rates, strata levies, land tax updates, and vacancy protection insurance wrappers.
      `,
    };