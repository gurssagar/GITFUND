'use client'
import React, { createContext, useContext, useState } from "react";

type SidebarContextType = {
  isShrunk: boolean;
  setIsShrunk: (val: boolean) => void;
};

const chatSidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const ChatSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShrunk, setIsShrunk] = useState(false);
  return (
    <chatSidebarContext.Provider value={{ isShrunk, setIsShrunk }}>
      {children}
    </chatSidebarContext.Provider>
  );
};

export const usechatSidebarContext = () => {
  const ctx = useContext(chatSidebarContext);
  if (!ctx) throw new Error("usechatSidebarContext must be used within chatSidebarProvider");
  return ctx;
};