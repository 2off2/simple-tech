import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  BarChart3,
  Upload,
  TrendingUp,
  Activity,
  Menu
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Visão Geral",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Upload de Dados",
    url: "/dashboard/upload",
    icon: Upload,
  },
  {
    title: "Previsão de Fluxo",
    url: "/dashboard/previsao",
    icon: TrendingUp,
  },
  {
    title: "Simulação de Cenários",
    url: "/dashboard/simulacao",
    icon: Activity,
  },
];

export function AppSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar.open === false;
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-60"} bg-sidebar transition-all duration-300`}>
      {/* Header with Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-sidebar-foreground">Simple</span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="p-2">
        <SidebarTrigger className="w-full justify-start" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}