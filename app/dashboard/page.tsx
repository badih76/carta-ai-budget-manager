import React from 'react'

function DashBoard() {
    // In production, fetch dashboard data from your database here
    const insights = {
        alert: "Your food spending is 18% higher than usual for the second week of the month. Consider adjusting your dining budget to avoid a cash crunch by day 25.",
        metrics: [
        { name: "Total Balance", value: "$14,842.50", change: "+12.3% vs last month", positive: true },
        { name: "Monthly Spent", value: "$3,120.45", change: "72% of $4,300 limit", positive: false },
        { name: "Projected Savings", value: "$1,850.00", change: "On track for house goal", positive: true }
        ]
    };
    return (
        <>
            <div className="flex justify-between items-center">
                <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Financial Dashboard</h1>
                <p className="text-sm text-slate-400">Real-time health snapshot and predictive insights.</p>
                </div>
            </div>

            {/* AI Ambient Insights Banner */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex gap-4 items-start">
                <div className="mt-0.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 font-mono text-xs font-bold tracking-wider">
                AI INSIGHT
                </div>
                <p className="text-sm text-emerald-300/90 leading-relaxed">
                {insights.alert}
                </p>
            </div>

            {/* Financial Health Core Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {insights.metrics.map((metric) => (
                <div key={metric.name} className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
                    <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">{metric.name}</p>
                    <p className="text-3xl font-bold text-white mt-2 tracking-tight">{metric.value}</p>
                    <p className={`text-xs mt-2 ${metric.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {metric.change}
                    </p>
                </div>
                ))}
            </div>

            {/* Grid for Secondary Operational Displays */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <h2 className="text-sm font-semibold text-slate-200 mb-4">Recent Transactions</h2>
                <div className="space-y-3">
                    {[
                    { desc: 'Grill\'d Burgers', cat: 'Dining Out', amt: '-$45.00', date: 'Yesterday' },
                    { desc: 'Woolworths Corporate', cat: 'Groceries', amt: '-$132.40', date: '15 Jul' },
                    { desc: 'Stripe Payout', cat: 'Income', amt: '+$4,250.00', date: '14 Jul' }
                    ].map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0 text-sm">
                        <div>
                        <p className="font-medium text-slate-200">{t.desc}</p>
                        <p className="text-xs text-slate-500">{t.cat} • {t.date}</p>
                        </div>
                        <span className={`font-mono font-medium ${t.amt.startsWith('+') ? 'text-emerald-400' : 'text-slate-300'}`}>{t.amt}</span>
                    </div>
                    ))}
                </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <h2 className="text-sm font-semibold text-slate-200 mb-4">Budget Limits Breakdown</h2>
                <div className="space-y-4">
                    {[
                    { category: 'Housing & Utilities', spent: 1200, limit: 1500, color: 'bg-emerald-500' },
                    { category: 'Food & Dining', spent: 780, limit: 900, color: 'bg-amber-500' },
                    { category: 'Transport', spent: 340, limit: 400, color: 'bg-sky-500' }
                    ].map((b) => {
                    const pct = Math.min((b.spent / b.limit) * 100, 100);
                    return (
                        <div key={b.category} className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-300">{b.category}</span>
                            <span className="text-slate-400">${b.spent} / ${b.limit}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className={`h-full ${b.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
            </div>
        </>
    )
}

export default DashBoard