'use client';

import { usePathname } from 'next/navigation';
import MultiStepSignup from './MultiStepSignup';

export default function SignupVisibility() {
  const pathname = usePathname() || '';
  
  if (['/', '/login'].includes(pathname.toLowerCase())) {
    return null;
  }
  
  return <MultiStepSignup />;
}