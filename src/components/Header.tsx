import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Failed to sign out");
        return;
      }
      console.log("User signed out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error in handleLogout:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, Investor</h1>
        <p className="text-gray-400">Your portfolio is performing well today</p>
      </div>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </header>
  );
};