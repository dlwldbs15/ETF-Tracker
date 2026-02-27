"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Sidebar, MobileDrawer } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { QueryProvider } from "@/lib/queries/query-provider";
import { PortfolioProvider } from "@/context/portfolio-context";
import { GlobalSearch } from "@/components/Search";
import { RouteProgressBar } from "@/components/route-progress";

const ShellContext = createContext<{
  openSidebar: () => void;
  openSearch: () => void;
}>({
  openSidebar: () => {},
  openSearch: () => {},
});

export function useShell() {
  return useContext(ShellContext);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openSidebar = useCallback(() => setDrawerOpen(true), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <QueryProvider>
      <PortfolioProvider>
        <ShellContext.Provider value={{ openSidebar, openSearch }}>
          <div className="flex min-h-screen">
            <Sidebar />
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <main className="flex-1 pb-14 md:pb-0 lg:ml-60">{children}</main>
            <BottomNav />
          </div>
          <RouteProgressBar />
          <GlobalSearch open={searchOpen} onClose={closeSearch} />
        </ShellContext.Provider>
      </PortfolioProvider>
    </QueryProvider>
  );
}
