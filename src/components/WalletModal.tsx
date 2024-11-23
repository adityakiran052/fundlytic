import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DollarSign } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onAddMoney: (amount: number) => void;
}

export const WalletModal = ({ isOpen, onClose, balance, onAddMoney }: WalletModalProps) => {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleAddMoney = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    onAddMoney(numAmount);
    setAmount("");
    toast({
      title: "Money added successfully",
      description: `₹${numAmount.toFixed(2)} has been added to your wallet`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <DollarSign className="text-primary h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Balance</p>
              <p className="text-2xl font-bold">₹{balance.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Add Money</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
              />
              <Button onClick={handleAddMoney}>Add</Button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Connected Bank Account: **** **** **** 1234 (Demo)
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};