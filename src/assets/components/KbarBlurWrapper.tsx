'use client';

import React from 'react';
import { useKBar } from 'kbar';
import SearchModal from './SearchModal';
import { useSearch } from './SearchContext';
export default function KbarBlurWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
    const { isSearchOpen, toggleSearchModal, closeSearchModal } = useSearch();
    const { query } = useKBar();
    console.log(isSearchOpen,'query') // <-- query is a string, not a booleans like in the ap

  return <div className={isSearchOpen ? 'blur blur-[2px]' : ''}>{children}</div>;
}