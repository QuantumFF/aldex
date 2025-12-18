"use client";

import {
  Check,
  Disc,
  Heart,
  Library,
  List,
  Play,
  Plus,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { DashboardView } from "@/app/dashboard/page";

const data = {
  user: {
    name: "Aldex User",
    email: "user@example.com",
    avatar: "",
  },
  collection: [
    {
      title: "Library",
      id: "library" as DashboardView,
      icon: Library,
    },
    {
      title: "Wishlist",
      id: "wishlist" as DashboardView,
      icon: Heart,
    },
  ],
  progress: [
    {
      title: "Backlog",
      id: "backlog" as DashboardView,
      icon: List,
    },
    {
      title: "Active",
      id: "active" as DashboardView,
      icon: Play,
    },
    {
      title: "Completed",
      id: "completed" as DashboardView,
      icon: Check,
    },
  ],
  manage: [
    {
      title: "Add Album",
      id: "add-album" as DashboardView,
      icon: Plus,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNavigate: (view: DashboardView) => void;
  activeView: DashboardView;
}

export function AppSidebar({ onNavigate, activeView, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <button onClick={() => onNavigate("library")}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Disc className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Aldex</span>
                  <span className="truncate text-xs">Personal Music Tracker</span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.collection} label="Collection" onNavigate={onNavigate} activeView={activeView} />
        <NavMain items={data.progress} label="Progress" onNavigate={onNavigate} activeView={activeView} />
        <NavMain items={data.manage} label="Manage" onNavigate={onNavigate} activeView={activeView} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
