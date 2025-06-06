'use client'
import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

type SidebarContextType = {
  isShrunk: boolean;
  setIsShrunk: (val: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShrunk, setIsShrunk] = useState(false);
  
  // Memoize the setIsShrunk function to prevent unnecessary rerenders
  const memoizedSetIsShrunk = useCallback((val: boolean) => {
    setIsShrunk(val);
  }, []);
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({ 
    isShrunk, 
    setIsShrunk: memoizedSetIsShrunk 
  }), [isShrunk, memoizedSetIsShrunk]);
  
  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebarContext must be used within SidebarProvider");
  return ctx;
};