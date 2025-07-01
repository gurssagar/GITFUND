'use client';
import { useEffect } from 'react';
import SearchModal from './SearchModal';
import { useSearch } from './SearchContext'; // Import the context hook
import {Suspense} from'react';
// Removed unused imports: Image, Link, useSession, Sidebar
// Removed useState as isSearchOpen is now managed by context

export default function Kbar() {
    const { isSearchOpen, toggleSearchModal, closeSearchModal } = useSearch(); // Use the context

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'K')) {
                event.preventDefault();
                toggleSearchModal(); // Use context function
            }
            if (event.key === 'Escape' && isSearchOpen) {
                event.preventDefault();
                closeSearchModal(); // Use context function
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSearchOpen, toggleSearchModal, closeSearchModal]); // Add context functions to dependency array

    // This Kbar component itself doesn't render any visible UI directly,
    // but it's responsible for the Ctrl+K logic and rendering the modal.
    // You would include <Kbar /> in your main layout or a global provider.
    return (
        <>
            {/* SearchModal will now get its state from the context directly */}
            
            <SearchModal />

            
        </>
    );
}