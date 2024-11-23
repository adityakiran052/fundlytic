import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthChangeEvent } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("User already authenticated:", session.user.id);
        navigate("/");
      }
    };
    
    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log("Auth state changed:", event);
      
      if (event === "USER_UPDATED" && session) {
        console.log("User authenticated:", session.user.id);
        navigate("/");
      }
      
      if (event === "SIGNED_OUT") {
        console.log("User signed out");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to MutualFund App
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your portfolio
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
          onError={(error) => {
            console.error("Auth error:", error);
            if (error.message.includes("User already registered")) {
              toast.error("This email is already registered. Please try logging in instead.");
            } else {
              toast.error(error.message);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;