'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

// Define a more specific type for a user if available, otherwise 'any' is a placeholder
type UserType = any; 

type SidebarContextType = {
  isShrunk: boolean;
  setIsShrunk: (val: boolean) => void;
  selectedUser: UserType | null; // Updated type
  setSelectedUser: (user: UserType | null) => void; // Updated type
  allUsers: UserType[];
  assignedUsers: UserType[];
  filteredUsers: UserType[];
  refreshUsers: () => Promise<void>;
  isLoadingUsers: boolean;
};

const chatSidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const ChatSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShrunk, setIsShrunk] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/signup', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("All users fetched:", data.users);
      setAllUsers(data.users || []);
      return data.users || [];
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }, []);

  const fetchAssignedUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/assignedIssue', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Assigned users fetched:", data.assignedIssues);
      setAssignedUsers(data.assignedIssues || []);
      return data.assignedIssues || [];
    } catch (error) {
      console.error("Error fetching assigned users:", error);
      return [];
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      await Promise.all([fetchAllUsers(), fetchAssignedUsers()]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [fetchAllUsers, fetchAssignedUsers]);

  // Update filtered users whenever allUsers or assignedUsers changes
  useEffect(() => {
    const filterUsers = () => {
      if (allUsers.length > 0 && assignedUsers.length > 0) {
        const filtered = allUsers.filter((user: UserType) =>
          assignedUsers.some((contributor: any) => contributor.Contributor_id === user.id)
        );
        console.log("Filtered users updated:", filtered);
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers([]);
      }
    };
    
    filterUsers();
  }, [allUsers, assignedUsers]);

  // Initial fetch
  useEffect(() => {
    refreshUsers();
  }, []);

  const contextValue = useMemo(() => ({
    isShrunk, 
    setIsShrunk, 
    selectedUser, 
    setSelectedUser,
    allUsers,
    assignedUsers,
    filteredUsers,
    refreshUsers,
    isLoadingUsers
  }), [
    isShrunk, 
    setIsShrunk, 
    selectedUser, 
    setSelectedUser,
    allUsers,
    assignedUsers,
    filteredUsers,
    refreshUsers,
    isLoadingUsers
  ]);
  
  return (
    <chatSidebarContext.Provider value={contextValue}>
      {children}
    </chatSidebarContext.Provider>
  );
};

export const usechatSidebarContext = () => {
  const ctx = useContext(chatSidebarContext);
  if (!ctx) throw new Error("usechatSidebarContext must be used within ChatSidebarProvider");
  return ctx;
};