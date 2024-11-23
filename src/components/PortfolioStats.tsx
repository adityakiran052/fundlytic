import { DollarSign, TrendingUp, PieChart } from "lucide-react";
import type { Portfolio } from "../types/portfolio";

interface PortfolioStatsProps {
  portfolio: Portfolio;
  onFundsClick: () => void;
}

export const PortfolioStats = ({ portfolio, onFundsClick }: PortfolioStatsProps) => {
  const portfolioValue = Object.values(portfolio).reduce(
    (total, { units, fund }) => total + units * fund.nav,
    0
  );

  const totalReturns = Object.values(portfolio).reduce((total, { units, fund, purchaseNav }) => {
    const currentValue = units * fund.nav;
    const investedValue = units * purchaseNav;
    return total + (currentValue - investedValue);
  }, 0);

  const totalInvestedValue = Object.values(portfolio).reduce(
    (total, { units, purchaseNav }) => total + units * purchaseNav,
    0
  );

  const totalReturnPercentage = totalInvestedValue > 0 
    ? ((totalReturns / totalInvestedValue) * 100).toFixed(2)
    : '0.00';

  // Calculate expected returns based on 1Y returns of each fund
  const expectedReturns = Object.values(portfolio).reduce((total, { units, fund, purchaseNav }) => {
    const investedValue = units * purchaseNav;
    const expectedReturnPercentage = parseFloat(fund.return1y);
    const expectedValue = investedValue * (1 + expectedReturnPercentage / 100);
    return total + (expectedValue - investedValue);
  }, 0);

  const expectedReturnPercentage = totalInvestedValue > 0
    ? ((expectedReturns / totalInvestedValue) * 100).toFixed(2)
    : '0.00';

  return (
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
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Total Returns</p>
              <p className="text-xl font-bold text-green-400">
                ₹{totalReturns.toFixed(2)} ({totalReturnPercentage}%)
              </p>
              <p className="text-sm text-blue-400">
                Expected: ₹{expectedReturns.toFixed(2)} ({expectedReturnPercentage}%)
              </p>
            </div>
          </div>
        </div>
        <div className="text-primary text-sm">Live returns</div>
      </div>

      <div className="glass-card p-6 rounded-xl cursor-pointer hover:bg-card-hover transition-colors" onClick={onFundsClick}>
        <div className="flex items-center mb-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <PieChart className="text-primary h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-400">Funds Invested</p>
            <p className="text-2xl font-bold">{Object.keys(portfolio).length}</p>
          </div>
        </div>
        <div className="text-gray-400 text-sm">Click to view details</div>
      </div>
    </div>
  );
};