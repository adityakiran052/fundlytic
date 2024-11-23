import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import type { MutualFund } from "../services/mutualFundService";

interface FundListProps {
  funds: MutualFund[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectFund: (fund: MutualFund) => void;
  portfolio: Record<string, { units: number }>;
}

export const FundList = ({
  funds,
  searchTerm,
  onSearchChange,
  onSelectFund,
  portfolio,
}: FundListProps) => {
  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {funds
          .filter((fund) =>
            fund.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((fund) => (
            <Card
              key={fund.id}
              className="p-4 hover:bg-card-hover transition-colors cursor-pointer"
              onClick={() => onSelectFund(fund)}
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
  );
};