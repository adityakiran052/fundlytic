import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AuthError } from "@supabase/supabase-js";

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
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === "SIGNED_IN" && session) {
        console.log("User authenticated:", session.user.id);
        navigate("/");
      }
      
      if (event === "SIGNED_OUT") {
        console.log("User signed out");
      }

      // Handle registration and login errors
      switch (event) {
        case "USER_REGISTRATION_ERROR":
          const regError = session as unknown as { error: AuthError };
          if (regError?.error?.message.includes("User already registered")) {
            toast.error("This email is already registered. Please try signing in instead.");
          }
          break;
        
        case "PASSWORD_RECOVERY_ERROR":
        case "SIGN_IN_ERROR":
          toast.error("Invalid login credentials. Please try again.");
          break;
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
          localization={{
            variables: {
              sign_up: {
                button_label: "Sign up",
                email_label: "Email",
                password_label: "Create a Password (minimum 6 characters)",
                loading_button_label: "Creating account ...",
                social_provider_text: "Sign in with",
                confirmation_text: "Check your email for the confirmation link",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;