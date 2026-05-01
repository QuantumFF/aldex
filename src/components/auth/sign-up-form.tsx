import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { OAuthButton } from "./oauth-button";
import { AuthSeparator } from "./auth-separator";
import { PasswordInput } from "./password-input";

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

      <OAuthButton isLoading={isLoading} onClick={handleOAuth} />

      <AuthSeparator />

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
          <PasswordInput
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-12 bg-muted/30"
            required
          />
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
