"use client"

import { truncate } from "node:fs"
import { createContext, useContext, useState, ReactNode } from "react"

type SignupContextType = {
  showSignup: boolean
  setShowSignup: (show: boolean) => void
}

export const SignupContext = createContext<SignupContextType>({
  showSignup: false,
  setShowSignup: () => {},
})

export function SignupProvider({ children }: { children: ReactNode }) {
  const [showSignup, setShowSignup] = useState(false)

  return (
    <SignupContext.Provider value={{ showSignup, setShowSignup }}>
      {children}
    </SignupContext.Provider>
  )
}

export function useSignup() {
  return useContext(SignupContext)
}

