import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, PieChart, Search } from "lucide-react";

const mockData = [
  { date: "Jan", value: 4000 },
  { date: "Feb", value: 3000 },
  { date: "Mar", value: 5000 },
  { date: "Apr", value: 4800 },
  { date: "May", value: 6000 },
  { date: "Jun", value: 5500 },
];

const mockFunds = [
  { id: 1, name: "Vanguard 500 Index Fund", return: "+12.5%", aum: "$400B" },
  { id: 2, name: "Fidelity Growth Fund", return: "+8.2%", aum: "$120B" },
  { id: 3, name: "BlackRock Technology", return: "+15.7%", aum: "$85B" },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Investor</h1>
        <p className="text-gray-400">Your portfolio is performing well today</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <DollarSign className="text-primary h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Portfolio Value</p>
              <p className="text-2xl font-bold">$124,500</p>
            </div>
          </div>
          <div className="text-green-400 text-sm">+2.5% today</div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-accent/20 rounded-lg">
              <TrendingUp className="text-accent h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Return</p>
              <p className="text-2xl font-bold">+24.8%</p>
            </div>
          </div>
          <div className="text-primary text-sm">+5.2% this month</div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <PieChart className="text-primary h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Funds Invested</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">Across 4 categories</div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl mb-8">
        <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
        <div className="h-[300px] chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9b87f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#ffffff40" />
              <YAxis stroke="#ffffff40" />
              <Tooltip 
                contentStyle={{ 
                  background: "rgba(32, 19, 54, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px"
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#9b87f5"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Available Funds</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search funds..."
              className="pl-10 pr-4 py-2 bg-dark-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-4">
          {mockFunds.map((fund) => (
            <div
              key={fund.id}
              className="p-4 rounded-lg bg-dark-lighter hover:bg-dark transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{fund.name}</h3>
                  <p className="text-sm text-gray-400">AUM: {fund.aum}</p>
                </div>
                <div className="text-green-400 font-medium">{fund.return}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;