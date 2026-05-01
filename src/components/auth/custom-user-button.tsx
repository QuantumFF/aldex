import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useUser } from "@clerk/clerk-react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

export function CustomUserButton() {
  const { user } = useUser();
  const clerk = useClerk();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar className="h-9 w-9 border border-border/50 hover:opacity-80 transition-opacity">
          <AvatarImage src={user.imageUrl} alt={user.fullName || "User avatar"} />
          <AvatarFallback className="bg-muted">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 font-sans">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => clerk.openUserProfile()}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Manage Account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => clerk.signOut()}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
