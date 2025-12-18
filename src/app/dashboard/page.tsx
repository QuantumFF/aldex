import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AddAlbumForm } from "@/components/add-album-form";
import { AlbumLibrary } from "@/components/album-library";
import { useState } from "react";

export type DashboardView = "library" | "wishlist" | "backlog" | "active" | "completed" | "add-album";

export default function Page() {
  const [view, setView] = useState<DashboardView>("library");

  const renderContent = () => {
    switch (view) {
      case "add-album":
        return <AddAlbumForm />;
      case "library":
      case "wishlist":
      case "backlog":
      case "active":
      case "completed":
        return <AlbumLibrary type={view} />;
      default:
        return <AlbumLibrary type="library" />;
    }
  };

  const getViewLabel = () => {
    switch (view) {
      case "add-album":
        return "Add Album";
      case "library":
        return "Library";
      case "wishlist":
        return "Wishlist";
      case "backlog":
        return "Backlog";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      default:
        return "Library";
    }
  };

  const getParentLabel = () => {
    if (view === "add-album") return "Manage";
    if (["library", "wishlist"].includes(view)) return "Collection";
    return "Progress";
  };

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={setView} activeView={view} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    {getParentLabel()}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getViewLabel()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
