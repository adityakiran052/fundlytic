import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card } from "./ui/card";
import type { Portfolio } from "../types/portfolio";
import type { MutualFund } from "../services/mutualFundService";

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
}

export const PortfolioModal = ({ isOpen, onClose, portfolio }: PortfolioModalProps) => {
  const calculateReturns = (fund: MutualFund, units: number, purchaseNav: number) => {
    const currentValue = units * fund.nav;
    const investedValue = units * purchaseNav;
    const value = currentValue - investedValue;
    const percentage = (value / investedValue) * 100;
    return { value, percentage };
  };

  const calculateExpectedReturns = (fund: MutualFund, units: number, purchaseNav: number) => {
    // Using 1Y return as expected return percentage
    const expectedReturnPercentage = parseFloat(fund.return1y);
    const investedValue = units * purchaseNav;
    const expectedValue = investedValue * (1 + expectedReturnPercentage / 100);
    return (expectedValue - investedValue).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Your Investment Portfolio</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund Name</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Returns</TableHead>
                <TableHead>Expected Returns</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(portfolio).map(([fundId, { units, fund, purchaseNav }]) => {
                const returns = calculateReturns(fund, units, purchaseNav);
                const expectedReturns = calculateExpectedReturns(fund, units, purchaseNav);
                return (
                  <TableRow key={fundId}>
                    <TableCell>{fund.name}</TableCell>
                    <TableCell>{units}</TableCell>
                    <TableCell>₹{(units * fund.nav).toFixed(2)}</TableCell>
                    <TableCell className={returns.value >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ₹{returns.value.toFixed(2)} ({returns.percentage.toFixed(2)}%)
                    </TableCell>
                    <TableCell className="text-blue-400">
                      ₹{expectedReturns}
                    </TableCell>
                  </TableRow>
                )})}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};