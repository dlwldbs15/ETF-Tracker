"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { PortfolioProvider } from "@/context/portfolio-context";

const ShellContext = createContext<{ openSidebar: () => void }>({
  openSidebar: () => {},
});

export function useShell() {
  return useContext(ShellContext);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <PortfolioProvider>
      <ShellContext.Provider value={{ openSidebar }}>
        <div className="flex min-h-screen">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 lg:ml-60">{children}</main>
        </div>
      </ShellContext.Provider>
    </PortfolioProvider>
  );
}
