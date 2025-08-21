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
    title: "Upload de Dados",
    url: "/dashboard/upload",
    icon: Upload,
  },
  {
    title: "Visão Geral",
    url: "/dashboard",
    icon: BarChart3,
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
      {/* Header with Logo - Remove border to make it seamless */}
      <div className="p-4 bg-sidebar">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => window.location.href = '/'}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-sidebar-accent/20">
            <img 
              src="/lovable-uploads/cb98570b-3eaf-4009-9198-43d180016a3c.png" 
              alt="Simple Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-sidebar-foreground">Simple</span>
          )}
        </div>
      </div>

      {/* Decorative separator */}
      <div className="mx-4 h-px bg-sidebar-accent/30"></div>

      {/* Toggle Button */}
      <div className="p-2">
        <SidebarTrigger className="w-full justify-start hover:bg-sidebar-accent/20 rounded-lg transition-colors" />
      </div>

      {/* Another decorative separator */}
      <div className="mx-4 h-px bg-sidebar-accent/30 mb-2"></div>

      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item, index) => (
                <div key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm border border-sidebar-accent"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/30 hover:shadow-sm"
                          }`
                        }
                      >
                        <div className="flex-shrink-0">
                          <item.icon className="h-5 w-5" />
                        </div>
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {/* Separator between items (except for the last one) */}
                  {index < navigationItems.length - 1 && (
                    <div className="mx-6 my-2 h-px bg-sidebar-accent/20"></div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}