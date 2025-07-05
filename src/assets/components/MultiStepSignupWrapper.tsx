"use client";

import { usePathname } from 'next/navigation';
import MultiStepSignup from './MultiStepSignup';

export default function MultiStepSignupWrapper() {
  const pathname = usePathname();
  
  // Don't show on root or login pages
  if (['/', '/Login'].includes(pathname)) {
    return null;
  }

  return <MultiStepSignup />;
}