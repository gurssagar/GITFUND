'use client'
import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    KBarResults,
    useMatches
} from "kbar";

export default function KBarWrapper({ children, actions }: { 
    children: React.ReactNode,
    actions: any[]
}) {

    
    return (
        <KBarProvider actions={actions}>
            <KBarPortal>
                <KBarPositioner>
                    <KBarAnimator>
                        <KBarSearch />
                    </KBarAnimator>
                </KBarPositioner>
            </KBarPortal>
            {children}
        </KBarProvider>
    );
}