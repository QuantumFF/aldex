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

const data = {
  user: {
    name: "Aldex User",
    email: "user@example.com",
    avatar: "",
  },
  collection: [
    {
      title: "Library",
      url: "#",
      icon: Library,
      isActive: true,
    },
    {
      title: "Wishlist",
      url: "#",
      icon: Heart,
    },
  ],
  progress: [
    {
      title: "Backlog",
      url: "#",
      icon: List,
    },
    {
      title: "Active",
      url: "#",
      icon: Play,
    },
    {
      title: "Completed",
      url: "#",
      icon: Check,
    },
  ],
  manage: [
    {
      title: "Add Album",
      url: "#",
      icon: Plus,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Disc className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Aldex</span>
                  <span className="truncate text-xs">Personal Music Tracker</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.collection} label="Collection" />
        <NavMain items={data.progress} label="Progress" />
        <NavMain items={data.manage} label="Manage" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
