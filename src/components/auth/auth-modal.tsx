import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as React from "react";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onOpenChange, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = React.useState<"signin" | "signup">(defaultMode);

  // Reset mode when opened
  React.useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6 border-border/50 shadow-2xl bg-background rounded-xl overflow-hidden">
        {/* Decorative subtle background element */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === "signin" ? "Sign In" : "Sign Up"}</DialogTitle>
          <DialogDescription>
            Authenticate to access your Aldex collection.
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 pt-2 pb-2">
          {mode === "signin" ? (
            <SignInForm 
              onSuccess={() => onOpenChange(false)} 
              onToggleMode={() => setMode("signup")} 
            />
          ) : (
            <SignUpForm 
              onSuccess={() => onOpenChange(false)} 
              onToggleMode={() => setMode("signin")} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
