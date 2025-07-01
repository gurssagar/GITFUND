'use client';

import React, { memo, useMemo } from 'react';
import SearchModal from './SearchModal';
import { useSearch } from './SearchContext';

const KbarBlurWrapper = memo(({
  children,
}: {
  children: React.ReactNode;
}) => {
    const { isSearchOpen } = useSearch();
    // Remove unused variables and console.log to reduce unnecessary work
    
    // Use useMemo to only recompute the className when isSearchOpen changes
    const blurClass = useMemo(() => isSearchOpen ? 'blur blur-[2px]' : '', [isSearchOpen]);
    
    return <div className={blurClass}>{children}</div>;
});

export default KbarBlurWrapper;