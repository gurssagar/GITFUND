'use client'
import React, { createContext, useContext, useState } from "react";

// Define a more specific type for a user if available, otherwise 'any' is a placeholder
type UserType = any; 

type SidebarContextType = {
  isShrunk: boolean;
  setIsShrunk: (val: boolean) => void;
  selectedUser: UserType | null; // Updated type
  setSelectedUser: (user: UserType | null) => void; // Updated type
};

const chatSidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const ChatSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShrunk, setIsShrunk] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null); // Updated initial state and type
  return (
    <chatSidebarContext.Provider value={{ isShrunk, setIsShrunk, selectedUser, setSelectedUser }}>
      {children}
    </chatSidebarContext.Provider> // Corrected closing tag position
  );
};

export const usechatSidebarContext = () => {
  const ctx = useContext(chatSidebarContext);
  if (!ctx) throw new Error("usechatSidebarContext must be used within chatSidebarProvider");
  return ctx;
};