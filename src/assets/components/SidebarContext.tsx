'use client'
import React, { createContext, useContext, useState } from "react";

type SidebarContextType = {
  isShrunk: boolean;
  setIsShrunk: (val: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShrunk, setIsShrunk] = useState(false);
  return (
    <SidebarContext.Provider value={{ isShrunk, setIsShrunk }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebarContext must be used within SidebarProvider");
  return ctx;
};