'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo } from 'react';

interface SearchContextType {
  isSearchOpen: boolean;
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>; // Exposing for direct control if needed
  openSearchModal: () => void;
  closeSearchModal: () => void;
  toggleSearchModal: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearchModal = useCallback(() => setIsSearchOpen(true), []);
  const closeSearchModal = useCallback(() => setIsSearchOpen(false), []);
  const toggleSearchModal = useCallback(() => setIsSearchOpen(prev => !prev), []);
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({ 
    isSearchOpen, 
    setIsSearchOpen, 
    openSearchModal, 
    closeSearchModal, 
    toggleSearchModal 
  }), [isSearchOpen, setIsSearchOpen, openSearchModal, closeSearchModal, toggleSearchModal]);

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};