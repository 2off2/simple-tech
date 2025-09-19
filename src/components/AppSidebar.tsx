import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { BarChart3, Upload, TrendingUp, Activity, Menu, Clock } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
const navigationItems = [{
  title: "Upload de Dados",
  url: "/dashboard/upload",
  icon: Upload
}, {
  title: "Dashboard Geral",
  url: "/dashboard",
  icon: BarChart3
}, {
  title: "Previsão de Fluxo",
  url: "/dashboard/previsao",
  icon: TrendingUp
}, {
  title: "Simulação de Cenários",
  url: "/dashboard/simulacao",
  icon: Activity
}];
export function AppSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar.open === false;
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  return <Sidebar className={`${collapsed ? "w-14" : "w-60"} bg-sidebar transition-all duration-300`}>
      {/* Header with Logo - Remove border to make it seamless */}
      <div className="p-4 bg-sidebar">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-sidebar-accent/20">
            <img src="/lovable-uploads/cb98570b-3eaf-4009-9198-43d180016a3c.png" alt="Simple Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && <span className="text-xl font-bold text-sidebar-foreground">Simple</span>}
        </div>
      </div>
      

      <SidebarContent className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-t border-amber-400/20 shadow-inner">
        <SidebarGroup className="mx-0 my-0 px-[22px] rounded-none">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item, index) => <div key={item.title}>
                  <SidebarMenuItem>
                    <NavLink to={item.url} end={item.url === "/dashboard"} className={({
                  isActive
                }) => `flex items-center gap-3 px-4 py-2 transition-colors duration-200 ${isActive ? "text-amber-400" : "text-white hover:text-amber-400"}`}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuItem>
                  
                  {/* Separator between items (except for the last one) */}
                  {index < navigationItems.length - 1 && <div className="mx-6 my-2 h-px bg-sidebar-accent/20"></div>}
                </div>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}