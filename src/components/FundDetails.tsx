import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFundHistory, type MutualFund } from '../services/mutualFundService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { toast } from 'sonner';

interface FundDetailsProps {
  fund: MutualFund;
  onBuy: (fund: MutualFund, units: number) => void;
  onSell: (fund: MutualFund, units: number) => void;
}

export const FundDetails = ({ fund, onBuy, onSell }: FundDetailsProps) => {
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['fundHistory', fund.id],
    queryFn: () => getFundHistory(fund.id),
  });

  const handleBuy = () => {
    const units = prompt('Enter number of units to buy:');
    if (units && !isNaN(Number(units))) {
      onBuy(fund, Number(units));
      toast.success(`Bought ${units} units of ${fund.name}`);
    }
  };

  const handleSell = () => {
    const units = prompt('Enter number of units to sell:');
    if (units && !isNaN(Number(units))) {
      onSell(fund, Number(units));
      toast.success(`Sold ${units} units of ${fund.name}`);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{fund.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9b87f5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#ffffff40" />
                <YAxis stroke="#ffffff40" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="nav"
                  stroke="#9b87f5"
                  fillOpacity={1}
                  fill="url(#colorNav)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Current NAV</p>
              <p className="text-lg font-bold">₹{fund.nav}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">1Y Return</p>
              <p className="text-lg font-bold">{fund.return1y}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleBuy} className="flex-1">Buy</Button>
            <Button onClick={handleSell} variant="outline" className="flex-1">Sell</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};