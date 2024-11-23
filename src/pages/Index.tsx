import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMutualFunds, type MutualFund } from "../services/mutualFundService";
import { FundDetails } from "../components/FundDetails";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { PortfolioStats } from "../components/PortfolioStats";
import { PortfolioModal } from "../components/PortfolioModal";
import { Header } from "../components/Header";
import { FundList } from "../components/FundList";
import type { Portfolio } from "../types/portfolio";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const { data: funds = [], isLoading: isFundsLoading, isError, refetch } = useQuery({
    queryKey: ['mutualFunds'],
    queryFn: getMutualFunds,
    retry: 2,
  });

  // Fetch user's data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          return;
        }

        console.log("Fetching data for user:", user.id);

        // Fetch wallet with error handling
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (walletError) {
          console.error("Error fetching wallet:", walletError);
          toast.error("Failed to fetch wallet data");
          return;
        }

        if (!walletData) {
          console.log("Creating new wallet for user");
          // Create wallet if it doesn't exist
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert([{ user_id: user.id, balance: 10000 }])
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating wallet:", createError);
            toast.error("Failed to create wallet");
            return;
          }

          if (newWallet) {
            console.log("New wallet created with balance:", newWallet.balance);
            setWalletBalance(newWallet.balance);
          }
        } else {
          console.log("Existing wallet found with balance:", walletData.balance);
          setWalletBalance(walletData.balance);
        }

        // Fetch portfolio holdings
        const { data: holdings, error: holdingsError } = await supabase
          .from('portfolio_holdings')
          .select('*')
          .eq('user_id', user.id);

        if (holdingsError) {
          console.error("Error fetching holdings:", holdingsError);
          toast.error("Failed to fetch portfolio holdings");
          return;
        }

        if (holdings && funds.length > 0) {
          console.log("Portfolio holdings found:", holdings.length);
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
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        toast.error("Failed to load user data");
      }
    };

    if (funds.length > 0) {
      fetchUserData();
    }
  }, [funds]); // Add funds as a dependency

  const handleBuy = async (fund: MutualFund, units: number): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to buy funds");
      return false;
    }

    const totalCost = units * fund.nav;
    
    if (totalCost > walletBalance) {
      return false;
    }

    try {
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
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error("Transaction failed");
      return false;
    }
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

  if (isFundsLoading) return <div className="min-h-screen p-6"><LoadingState /></div>;
  if (isError) return <div className="min-h-screen p-6"><ErrorState onRetry={() => refetch()} /></div>;

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <Header />

      <PortfolioStats 
        portfolio={portfolio}
        onFundsClick={() => setIsPortfolioModalOpen(true)}
        walletBalance={walletBalance}
        onAddMoney={handleAddMoney}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FundList
          funds={funds}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectFund={setSelectedFund}
          portfolio={portfolio}
        />

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
