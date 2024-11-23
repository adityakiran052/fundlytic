import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const { data: funds = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['mutualFunds'],
    queryFn: getMutualFunds,
    retry: 2,
  });

  // Fetch user's data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to manage your portfolio");
        return;
      }

      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .single();

      if (!walletData) {
        // Create wallet if it doesn't exist
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert([{ user_id: user.id, balance: 10000 }])
          .select()
          .single();
          
        if (newWallet) {
          setWalletBalance(newWallet.balance);
        }
      } else {
        setWalletBalance(walletData.balance);
      }

      // Fetch portfolio holdings
      const { data: holdings } = await supabase
        .from('portfolio_holdings')
        .select('*');

      if (holdings) {
        const portfolioData: Portfolio = {};
        holdings.forEach(holding => {
          const fund = funds.find(f => f.id === holding.fund_id);
          if (fund) {
            portfolioData[holding.fund_id] = {
              units: holding.units,
              fund,
              purchaseNav: holding.purchase_nav
            };
          }
        });
        setPortfolio(portfolioData);
      }
    };

    fetchUserData();
  }, [funds]);

  const handleBuy = async (fund: MutualFund, units: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to buy funds");
      return false;
    }

    const totalCost = units * fund.nav;
    
    if (totalCost > walletBalance) {
      return false;
    }

    // Start transaction
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: walletBalance - totalCost })
      .eq('user_id', user.id);

    if (walletError) {
      toast.error("Failed to update wallet");
      return false;
    }

    const { error: portfolioError } = await supabase
      .from('portfolio_holdings')
      .insert([{
        user_id: user.id,
        fund_id: fund.id,
        units,
        purchase_nav: fund.nav
      }]);

    if (portfolioError) {
      toast.error("Failed to update portfolio");
      // Rollback wallet change
      await supabase
        .from('wallets')
        .update({ balance: walletBalance })
        .eq('user_id', user.id);
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

  const handleSell = async (fund: MutualFund, units: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to sell funds");
      return;
    }

    const currentHolding = portfolio[fund.id];
    if (!currentHolding || currentHolding.units < units) return;

    const saleValue = units * fund.nav;

    // Update wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: walletBalance + saleValue })
      .eq('user_id', user.id);

    if (walletError) {
      toast.error("Failed to update wallet");
      return;
    }

    // Update portfolio
    const { error: portfolioError } = await supabase
      .from('portfolio_holdings')
      .update({ units: currentHolding.units - units })
      .eq('user_id', user.id)
      .eq('fund_id', fund.id);

    if (portfolioError) {
      toast.error("Failed to update portfolio");
      // Rollback wallet change
      await supabase
        .from('wallets')
        .update({ balance: walletBalance })
        .eq('user_id', user.id);
      return;
    }

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

  const handleAddMoney = async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to add money");
      return;
    }

    const { error } = await supabase
      .from('wallets')
      .update({ balance: walletBalance + amount })
      .eq('user_id', user.id);

    if (error) {
      toast.error("Failed to add money to wallet");
      return;
    }

    setWalletBalance(prev => prev + amount);
  };

  const filteredFunds = funds.filter(fund => 
    fund.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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