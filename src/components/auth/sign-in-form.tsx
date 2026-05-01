import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { OAuthButton } from "./oauth-button";
import { AuthSeparator } from "./auth-separator";
import { PasswordInput } from "./password-input";

interface SignInFormProps {
  onSuccess: () => void;
  onToggleMode: () => void;
}

export function SignInForm({ onSuccess, onToggleMode }: SignInFormProps) {
  const { signIn, isLoaded, setActive } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [resetCode, setResetCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState<"credentials" | "forgot_password" | "reset_password">("credentials");

  if (!isLoaded) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        onSuccess();
      } else if (result.status === "needs_second_factor") {
        // We are sticking to standard email/password for this UI
        setError("Two-factor authentication is not supported in this custom UI yet.");
      } else {
        console.log(result);
        setError("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message || err.errors[0].longMessage);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset_password");
    } catch (err: any) {
      console.error(err);
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message || err.errors[0].longMessage);
      } else {
        setError("Failed to send reset code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      setError("Please enter the verification code and a new password.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
      });

      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        onSuccess();
      } else {
        console.log(result);
        setError("Failed to reset password. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message || err.errors[0].longMessage);
      } else {
        setError("Invalid code or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google") => {
    setIsLoading(true);
    setError("");
    try {
      await signIn.authenticateWithRedirect({
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

  if (step === "forgot_password") {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Reset Password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a reset code.
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-12 bg-muted/30"
            required
          />

          {error && (
            <div className="text-[13px] font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-full font-serif font-bold text-lg hover:scale-[1.02] transition-transform">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Send Reset Code
          </Button>
        </form>

        <div className="text-center text-sm">
          <button
            onClick={() => {
              setError("");
              setStep("credentials");
            }}
            className="text-muted-foreground hover:text-foreground font-medium"
            type="button"
            disabled={isLoading}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (step === "reset_password") {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-serif font-bold tracking-tight">New Password</h2>
          <p className="text-sm text-muted-foreground">
            Enter the code sent to <span className="font-medium text-foreground">{email}</span> and your new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="6-digit code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              disabled={isLoading}
              className="h-14 text-center text-xl tracking-widest bg-muted/30 font-mono"
              maxLength={6}
              required
            />
              <PasswordInput
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 bg-muted/30"
                required
              />
          </div>

          {error && (
            <div className="text-[13px] font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-full font-serif font-bold text-lg hover:scale-[1.02] transition-transform">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Reset Password
          </Button>
        </form>

        <div className="text-center text-sm">
          <button
            onClick={() => {
              setError("");
              setStep("credentials");
            }}
            className="text-muted-foreground hover:text-foreground font-medium"
            type="button"
            disabled={isLoading}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-serif font-bold tracking-tight">Sign In</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back to your archive.
        </p>
      </div>

      <OAuthButton isLoading={isLoading} onClick={handleOAuth} />

      <AuthSeparator />

      <form onSubmit={handleSignIn} className="space-y-4">
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
          <div className="space-y-1">
            <PasswordInput
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-muted/30"
              required
            />
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("forgot_password");
                }}
                disabled={isLoading}
                className="text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-[13px] font-medium text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-full font-serif font-bold text-lg hover:scale-[1.02] transition-transform">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <button
          onClick={onToggleMode}
          className="text-primary font-semibold hover:underline"
          type="button"
          disabled={isLoading}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
