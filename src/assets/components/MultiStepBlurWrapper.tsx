'use client'

import React from 'react'
import { useSignup } from '../../context/SignupContext'

interface BlurWrapperProps {
  children: React.ReactNode
}

const MultiStepBlurWrapper = ({ children }: BlurWrapperProps) => {
  const { showSignup } = useSignup()
  
  return (
    <div className={showSignup ? 'backdrop-blur-sm ' : ''}>
      {children}
    </div>
  )
}

export default MultiStepBlurWrapper