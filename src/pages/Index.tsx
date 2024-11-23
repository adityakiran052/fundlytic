import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, PieChart, Search } from "lucide-react";
import { getMutualFunds, type MutualFund } from "../services/mutualFundService";
import { FundDetails } from "../components/FundDetails";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";

interface Portfolio {
  [fundId: string]: {
    units: number;
    fund: MutualFund;
    purchaseNav: number;
  };
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio>({});

  const { data: funds = [], isLoading } = useQuery({
    queryKey: ['mutualFunds'],
    queryFn: getMutualFunds,
  });

  const filteredFunds = funds.filter(fund => 
    fund.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const portfolioValue = Object.values(portfolio).reduce(
    (total, { units, fund }) => total + units * fund.nav,
    0
  );

  const totalReturns = Object.values(portfolio).reduce((total, { units, fund, purchaseNav }) => {
    const currentValue = units * fund.nav;
    const investedValue = units * purchaseNav;
    return total + (currentValue - investedValue);
  }, 0);

  const handleBuy = (fund: MutualFund, units: number) => {
    console.log(`Buying ${units} units of ${fund.name}`);
    setPortfolio(prev => ({
      ...prev,
      [fund.id]: {
        units: (prev[fund.id]?.units || 0) + units,
        fund,
        purchaseNav: fund.nav
      }
    }));
  };

  const handleSell = (fund: MutualFund, units: number) => {
    console.log(`Selling ${units} units of ${fund.name}`);
    setPortfolio(prev => {
      const currentUnits = prev[fund.id]?.units || 0;
      if (currentUnits < units) {
        alert("Not enough units to sell");
        return prev;
      }
      const newUnits = currentUnits - units;
      if (newUnits === 0) {
        const { [fund.id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [fund.id]: {
          ...prev[fund.id],
          units: newUnits,
        }
      };
    });
  };

  if (isLoading) {
    return <div className="min-h-screen p-6">Loading...</div>;
  }

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
              <p className="text-2xl font-bold">₹{portfolioValue.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-green-400 text-sm">Live value</div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-accent/20 rounded-lg">
              <TrendingUp className="text-accent h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Returns</p>
              <p className="text-2xl font-bold text-green-400">
                ₹{totalReturns.toFixed(2)} ({((totalReturns / (portfolioValue - totalReturns)) * 100).toFixed(2)}%)
              </p>
            </div>
          </div>
          <div className="text-primary text-sm">Live returns</div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <PieChart className="text-primary h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Funds Invested</p>
              <p className="text-2xl font-bold">{Object.keys(portfolio).length}</p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">Active investments</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Available Funds</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search funds..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredFunds.map((fund) => (
              <Card
                key={fund.id}
                className="p-4 hover:bg-card-hover transition-colors cursor-pointer"
                onClick={() => setSelectedFund(fund)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{fund.name}</h3>
                    <p className="text-sm text-gray-400">NAV: ₹{fund.nav}</p>
                  </div>
                  <div>
                    <p className="text-green-400 font-medium">{fund.return1y}</p>
                    {portfolio[fund.id] && (
                      <p className="text-sm text-gray-400">
                        Units: {portfolio[fund.id].units}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          {selectedFund ? (
            <FundDetails
              fund={selectedFund}
              onBuy={handleBuy}
              onSell={handleSell}
              currentHolding={portfolio[selectedFund.id]}
            />
          ) : (
            <div className="text-center text-gray-400">
              Select a fund to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;