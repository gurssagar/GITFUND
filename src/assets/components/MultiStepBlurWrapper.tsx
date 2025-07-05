'use client'

import React,{useMemo} from 'react'
import { useSignup } from '../../context/SignupContext'

interface BlurWrapperProps {
  children: React.ReactNode
}

const MultiStepBlurWrapper = ({ children }: BlurWrapperProps) => {
  const { showSignup } = useSignup()
  const blurSignupClass = useMemo(() => showSignup ? '' : 'hidden', [showSignup]);
  return (
    <div className={blurSignupClass}>
      {children}
    </div>
  )
}

export default MultiStepBlurWrapper