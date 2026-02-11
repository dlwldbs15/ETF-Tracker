"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Sidebar, MobileDrawer } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { PortfolioProvider } from "@/context/portfolio-context";

const ShellContext = createContext<{ openSidebar: () => void }>({
  openSidebar: () => {},
});

export function useShell() {
  return useContext(ShellContext);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openSidebar = useCallback(() => setDrawerOpen(true), []);

  return (
    <PortfolioProvider>
      <ShellContext.Provider value={{ openSidebar }}>
        <div className="flex min-h-screen">
          {/* Desktop: fixed sidebar */}
          <Sidebar />
          {/* Mobile: drawer (menu button trigger) */}
          <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          {/* Main content — pb-14 on mobile for bottom nav clearance */}
          <main className="flex-1 pb-14 md:pb-0 lg:ml-60">{children}</main>
          {/* Mobile bottom nav */}
          <BottomNav />
        </div>
      </ShellContext.Provider>
    </PortfolioProvider>
  );
}
