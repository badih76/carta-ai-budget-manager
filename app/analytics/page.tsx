'use client';

import React, { useState, useEffect } from 'react';
import { fetchAnalyticsData, askLedgerAI } from './actions';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, Compass, 
  Sparkles, Bot, MessageSquare, Search, Calendar, Layers,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { getCategoryMap } from './actions';
import HttpStatus from '@/lib/HttpStatus';
import { ToastError } from '@/lib/sonnerUtils';

// Define this outside or inside your component
const gridColsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export default function AnalyticsPage() {
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  
  // Existing States...
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [majorCategoryData, setMajorCategoryData] = useState<any[]>([]);
  const [subCategoryData, setSubCategoryData] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [currentCashBalance, setCurrentCashBalance] = useState(0);
  const [baseMonthlyBurn, setBaseMonthlyBurn] = useState(0);
  
  // New Budget States
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [budgetTotals, setBudgetTotals] = useState({ limit: 0, actual: 0, utilization: 0 });

  // UI States
  const [selectedCategorySlice, setSelectedCategorySlice] = useState<string | null>(null);  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [categoryView, setCategoryView] = useState<'major' | 'sub'>('major');
  const [chartMode, setChartMode] = useState<'donut' | 'bar'>('donut');
  const [expenseAdjustment, setExpenseAdjustment] = useState<number>(0);
  const [newHireCount, setNewHireCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [expCategoriesMap, setExpCategoriesMap] = useState<Record<string, string> | null>(null);
  const [ budgetBreakdownColCount, setBudgetBreakdownColCount ] = useState<number>(3);

  // userId
  const [userId, setUserId] = useState<string | null>('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchAnalyticsData(selectedAccount, dateRange, userId!);
        // ... set existing data ...
        setCashFlowData(data.cashFlow || []);
        setMajorCategoryData(data.majorCategories);
        setSubCategoryData(data.subCategories);

        console.log(data.subCategories);
        // setSubscriptions(data.subscriptions);
        setCurrentCashBalance(data.currentCashBalance || 84000);

        // Calculate dynamic base burn from latest month expenses
        const latestMonth = data.cashFlow[data.cashFlow.length - 1];
        setBaseMonthlyBurn(latestMonth ? latestMonth.expense : 9800);

        let ecMap: Record<string, string> | null = null;

        try {
          const result = await getCategoryMap(userId!);
          if (result.status !== HttpStatus.OK) throw new Error(result.error!);
          setExpCategoriesMap(result.data);
          ecMap = result.data;

        } catch (error) {
          ToastError(`There was an issue fetching categories map. ${(error as Error).message}.`);
          setExpCategoriesMap(null);
        }

        const budgetDataWithNames = data.budgetIntelligence.items.map(item => {
          let bwn = {
            category: item.category,
            limit: item.limit,
            actual: item.actual,
            utilization: item.utilization,
            status: item.status,
            cName: ecMap![item.category]
          };
          
          return bwn;
        })
        
        // Mock fallback if DB is empty for demo rendering
        setBudgetData(budgetDataWithNames || [
          { category: 'Operations', limit: 5000, actual: 4500, utilization: 90, status: 'On Track' },
          { category: 'Marketing', limit: 2000, actual: 2800, utilization: 140, status: 'Over Budget' },
          { category: 'Payroll & HR', limit: 6500, actual: 6200, utilization: 95, status: 'On Track' }
        ]);
        setBudgetTotals({
          limit: data.budgetIntelligence?.totalBudgeted || 13500,
          actual: data.budgetIntelligence?.totalActual || 13500,
          utilization: data.budgetIntelligence?.overallUtilization || 100
        });
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedAccount, dateRange]);

  useEffect(() => {
    console.log("BudgetData: ", budgetData);
    console.log('ECategMap: ', expCategoriesMap);
    console.log('Selected Acc: ', selectedAccount);
  }, [ budgetData ]);

  // ... (Keep existing handleAskLedger and simulatedBurn logic here) ...
  const handleAskLedger = async (queryText: string) => {
    if (!queryText.trim()) return;
    const userQ = queryText;
    setSearchQuery('');
    
    // Optimistic UI update
    setChatHistory(prev => [...prev, { q: userQ, a: "Analyzing ledger..." }]);
    
    try {
      const { answer } = await askLedgerAI(userQ);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].a = answer;
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].a = "Failed to query database.";
        return newHistory;
      });
    }
  };

  const simulatedBurn = Math.round((baseMonthlyBurn * (1 + expenseAdjustment / 100)) + (newHireCount * 5000));
  const projectedRunwayMonths = simulatedBurn > 0 ? (currentCashBalance / simulatedBurn).toFixed(1) : '∞';
  
  const projectionChartData = [
    { period: 'Current', balance: currentCashBalance },
    { period: '+30 Days', balance: Math.max(0, currentCashBalance - simulatedBurn) },
    { period: '+60 Days', balance: Math.max(0, currentCashBalance - (simulatedBurn * 2)) },
    { period: '+90 Days', balance: Math.max(0, currentCashBalance - (simulatedBurn * 3)) },
  ];
  

  if (isLoading) return <div className="text-white p-10 text-center animate-pulse">Synchronizing Ledger...</div>;

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* HEADER & GLOBAL CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Financial Matrix Analytics
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 bg-indigo-950/30">Live Intelligence</Badge>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time visual velocity, audit leak detection, and predictive cash flow modeling.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="bg-transparent border-none focus:outline-none text-white font-medium cursor-pointer">
              <option value="all" className="bg-slate-900">All Accounts</option>
              <option value="operating" className="bg-slate-900">Operating Account</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-transparent border-none focus:outline-none text-white font-medium cursor-pointer">
              <option value="30d" className="bg-slate-900">Last 30 Days</option>
              <option value="quarter" className="bg-slate-900">This Quarter</option>
            </select>
          </div>
          <Button onClick={() => setIsGeneratingAI(true)} disabled={isGeneratingAI} className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white font-medium">
            <Sparkles className={`w-4 h-4 mr-2 ${isGeneratingAI ? 'animate-spin' : ''}`} />
            {isGeneratingAI ? 'Analyzing...' : 'Generate AI Audit'}
          </Button>
        </div>
      </div>

      <Accordion multiple defaultValue={["kpis", "budget"]} className="w-full space-y-4">
        {/* MODULE 1: KPIs */}
        <AccordionItem value="kpis" className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden backdrop-blur-md">
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-800/50 hover:no-underline transition-colors">
            <div className="flex items-center gap-3 text-lg font-semibold text-white">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><Activity className="w-5 h-5" /></div>
              Executive Summary & Health Metrics
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-950/60 border-slate-800 text-slate-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-slate-400">Total Cash Balance</CardTitle>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">${currentCashBalance.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-950/60 border-slate-800 text-slate-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-slate-400">Monthly Burn Rate</CardTitle>
                  <TrendingDown className="w-4 h-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${baseMonthlyBurn.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* NEW MODULE: BUDGET INTELLIGENCE */}
        <AccordionItem value="budget" className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden backdrop-blur-md">
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-800/50 hover:no-underline transition-colors">
            <div className="flex items-center gap-3 text-lg font-semibold text-white">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20"><Target className="w-5 h-5" /></div>
              Budget Pacing & Variance Limits
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"> */}
            <div className="w-full">
              
              {/* Budget vs Actual Chart */}
              {/* <div className="lg:col-span-2 h-96 w-full bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="cName" type="category" stroke="#64748b" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="limit" name="Budget Limit" fill="#334155" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="actual" name="Actual Spend" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div> */}

              {/* Progress & Variance Inspector */}
              <div className='flex justify-start items-center pb-6 ml-4'>
                <span className='text-white mr-4'>Columns</span>
                {/* <Input type='number' min={1} max={5} value={budgetBreakdownColCount} onChange={(e) => setBudgetBreakdownColCount(parseInt(e.target.value))}></Input> */}
                <select 
                  className='bg-slate-400 rounded-sm p-1'
                  onChange={(e) => setBudgetBreakdownColCount(parseInt(e.target.value))}
                  value={budgetBreakdownColCount}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              <div className="space-y-4 bg-slate-600 p-4 border border-slate-800 rounded-xl w-full h-72 
                overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-transparent">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sector Utilization</h4>
                <div className={`space-y-4 w-full grid ${gridColsMap[budgetBreakdownColCount] || 'grid-cols-1'} gap-4`}>
                  {budgetData.map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-200">{item.cName}</span>
                        <span className={item.utilization > 100 ? "text-rose-400 font-bold" : "text-green-400 font-bold"}>
                          {Math.round(item.utilization)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.utilization > 100 ? 'bg-rose-500' : 'bg-green-500'}`} 
                          style={{ width: `${Math.min(item.utilization, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-300 text-right">
                        ${item.actual.toLocaleString()} / ${item.limit.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Variance Narrative */}
            {budgetData.some(b => b.utilization > 100) && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <span className="font-semibold text-rose-400">Budget Overrun Detected:</span> {budgetData.filter(b => b.utilization > 100).map(b => b.category).join(", ")} has exceeded the allocated cycle limit. Consider reducing discretionary ad spend in the final week of the cycle to offset the variance.
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* MODULE 2: CHARTS */}
        <AccordionItem value="charts" className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden backdrop-blur-md">
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-800/50 hover:no-underline transition-colors">
            <div className="flex items-center gap-3 text-lg font-semibold text-white">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20"><BarChart3 className="w-5 h-5" /></div>
              Financial Velocity & Categorical Breakdown
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Category Depth:</span>
                <Tabs value={categoryView} onValueChange={(v) => setCategoryView(v as 'major' | 'sub')} className="h-8">
                  <TabsList className="bg-slate-900 border border-slate-800 h-8">
                    <TabsTrigger value="major" className="text-xs px-3">Major Sectors</TabsTrigger>
                    <TabsTrigger value="sub" className="text-xs px-3">Subcategories</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Visual Mode:</span>
                <Tabs value={chartMode} onValueChange={(v) => setChartMode(v as 'donut' | 'bar')} className="h-8">
                  <TabsList className="bg-slate-900 border border-slate-800 h-8">
                    <TabsTrigger value="donut" className="text-xs px-3">Donut</TabsTrigger>
                    <TabsTrigger value="bar" className="text-xs px-3">Bar</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 h-72 w-full bg-slate-500 border border-slate-800/80 rounded-xl p-4">
                {chartMode === 'donut' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryView === 'major' ? majorCategoryData : subCategoryData} 
                        cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5} 
                        dataKey="value" onClick={(entry) => setSelectedCategorySlice(entry.name!)}>
                        {(categoryView === 'major' ? majorCategoryData : subCategoryData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={1} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* MODULE 4: PREDICTIVE */}
        <AccordionItem value="predictive" className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden backdrop-blur-md">
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-800/50 hover:no-underline transition-colors">
            <div className="flex items-center gap-3 text-lg font-semibold text-white">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Compass className="w-5 h-5" /></div>
              Predictive Cash Runway
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Simulation Parameters</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Recurring Spend Shift:</span>
                    <span className="font-bold text-cyan-400">{expenseAdjustment > 0 ? `+${expenseAdjustment}%` : `${expenseAdjustment}%`}</span>
                  </div>
                  <Slider value={[expenseAdjustment]} min={-30} max={30} step={5} onValueChange={(val) => setExpenseAdjustment(Array.isArray(val) ? val[0] : val)} />
                </div>
                <div className="pt-3 border-t border-slate-800 space-y-1">
                  <p className="text-xs text-slate-400">Simulated Monthly Velocity:</p>
                  <p className="text-xl font-bold text-white">${simulatedBurn.toLocaleString()} / mo</p>
                  <p className="text-xs text-cyan-400 font-semibold pt-1">Projected Runway: ~{projectedRunwayMonths} Months</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* MODULE 5: AI CONSOLE */}
        <AccordionItem value="ask-ai" className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden backdrop-blur-md">
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-800/50 hover:no-underline transition-colors">
            <div className="flex items-center gap-3 text-lg font-semibold text-white">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Bot className="w-5 h-5" /></div>
              Ask My Ledger
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-5">
            <form onSubmit={(e) => { e.preventDefault(); handleAskLedger(searchQuery); }} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ask about your matrix..." className="pl-9 bg-slate-950 border-slate-800 text-white" />
              </div>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium">Query Ledger</Button>
            </form>
            
            {chatHistory.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-slate-800 max-h-80 overflow-y-auto">
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className="space-y-2 bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs">
                    <p className="font-semibold text-indigo-400 flex items-center gap-1.5">{chat.q}</p>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l-2 border-indigo-500/30">{chat.a}</p>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}