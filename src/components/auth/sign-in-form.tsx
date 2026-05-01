import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/clerk-react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import * as React from "react";

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
  const [showPassword, setShowPassword] = React.useState(false);
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
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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
