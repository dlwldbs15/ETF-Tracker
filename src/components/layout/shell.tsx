"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Sidebar, MobileDrawer } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { QueryProvider } from "@/lib/queries/query-provider";
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
    <QueryProvider>
      <PortfolioProvider>
        <ShellContext.Provider value={{ openSidebar }}>
          <div className="flex min-h-screen">
            <Sidebar />
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <main className="flex-1 pb-14 md:pb-0 lg:ml-60">{children}</main>
            <BottomNav />
          </div>
        </ShellContext.Provider>
      </PortfolioProvider>
    </QueryProvider>
  );
}
