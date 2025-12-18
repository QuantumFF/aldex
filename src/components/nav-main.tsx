"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { DashboardView } from "@/app/dashboard/page";

export function NavMain({
  items,
  label = "Platform",
  onNavigate,
  activeView,
}: {
  items: {
    title: string;
    id: DashboardView;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      id: DashboardView;
    }[];
  }[];
  label?: string;
  onNavigate: (view: DashboardView) => void;
  activeView: DashboardView;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive || activeView === item.id}>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                isActive={activeView === item.id}
                onClick={() => onNavigate(item.id)}
              >
                <button>
                  <item.icon />
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            isActive={activeView === subItem.id}
                            onClick={() => onNavigate(subItem.id)}
                          >
                            <button>
                              <span>{subItem.title}</span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
