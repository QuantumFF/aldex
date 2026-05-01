import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/clerk-react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import * as React from "react";

interface SignUpFormProps {
  onSuccess: () => void;
  onToggleMode: () => void;
}

export function SignUpForm({ onSuccess, onToggleMode }: SignUpFormProps) {
  const { signUp, isLoaded, setActive } = useSignUp();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  if (!isLoaded) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send verification code to email
      await signUp.prepareVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: any) {
      console.error(err);
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message || err.errors[0].longMessage);
      } else {
        setError("Failed to sign up. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError("Please enter the verification code.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const result = await signUp.attemptVerification({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        onSuccess();
      } else {
        console.log(result);
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message || err.errors[0].longMessage);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google") => {
    setIsLoading(true);
    setError("");
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      console.error(err);
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message);
      } else {
        setError("Failed to authenticate with Google.");
      }
      setIsLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Verify Email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a verification code to <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="text"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading}
            className="h-14 text-center text-xl tracking-widest bg-muted/30 font-mono"
            maxLength={6}
            required
          />

          {error && (
            <div className="text-[13px] font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-full font-serif font-bold text-lg hover:scale-[1.02] transition-transform">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Verify & Continue
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-serif font-bold tracking-tight">Create Account</h2>
        <p className="text-sm text-muted-foreground">
          Start your personal archive today.
        </p>
      </div>

      <div className="grid gap-4">
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading}
          onClick={() => handleOAuth("oauth_google")}
          className="bg-background shadow-sm h-12"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
          )}
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="bg-background px-2 text-muted-foreground font-medium">
            Or
          </span>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-12 bg-muted/30"
            required
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-muted/30 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-[13px] font-medium text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-full font-serif font-bold text-lg hover:scale-[1.02] transition-transform">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Sign Up
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <button
          onClick={onToggleMode}
          className="text-primary font-semibold hover:underline"
          type="button"
          disabled={isLoading}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
