import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getMutualFunds, type MutualFund } from "../services/mutualFundService";
import { FundDetails } from "../components/FundDetails";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { PortfolioStats } from "../components/PortfolioStats";
import { PortfolioModal } from "../components/PortfolioModal";
import type { Portfolio } from "../types/portfolio";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(10000);

  const { data: funds = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['mutualFunds'],
    queryFn: getMutualFunds,
    retry: 2,
  });

  const filteredFunds = funds.filter(fund => 
    fund.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBuy = (fund: MutualFund, units: number) => {
    const totalCost = units * fund.nav;
    
    if (totalCost > walletBalance) {
      return false;
    }

    setWalletBalance(prev => prev - totalCost);
    setPortfolio(prev => ({
      ...prev,
      [fund.id]: {
        units: (prev[fund.id]?.units || 0) + units,
        fund,
        purchaseNav: fund.nav
      }
    }));
    
    return true;
  };

  const handleSell = (fund: MutualFund, units: number) => {
    const currentHolding = portfolio[fund.id];
    if (!currentHolding || currentHolding.units < units) return;

    const saleValue = units * fund.nav;
    setWalletBalance(prev => prev + saleValue);

    setPortfolio(prev => {
      const newUnits = currentHolding.units - units;
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

  const handleAddMoney = (amount: number) => {
    setWalletBalance(prev => prev + amount);
  };

  if (isLoading) return <div className="min-h-screen p-6"><LoadingState /></div>;
  if (isError) return <div className="min-h-screen p-6"><ErrorState onRetry={() => refetch()} /></div>;

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Investor</h1>
        <p className="text-gray-400">Your portfolio is performing well today</p>
      </header>

      <PortfolioStats 
        portfolio={portfolio}
        onFundsClick={() => setIsPortfolioModalOpen(true)}
        walletBalance={walletBalance}
        onAddMoney={handleAddMoney}
      />

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
              walletBalance={walletBalance}
            />
          ) : (
            <div className="text-center text-gray-400">
              Select a fund to view details
            </div>
          )}
        </div>
      </div>

      <PortfolioModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        portfolio={portfolio}
      />
    </div>
  );
};

export default Index;