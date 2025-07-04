"use client"

import { truncate } from "node:fs"
import { createContext, useContext, useState, ReactNode } from "react"

type SignupContextType = {
  showShowSignup: boolean
  setShowShowSignup: (show: boolean) => void
}

export const ShowSignupContext = createContext<SignupContextType>({
  showShowSignup: true,
  setShowShowSignup: () => {},
})

export function ShowSignupProvider({ children }: { children: ReactNode }) {
  const [showShowSignup, setShowShowSignup] = useState(true)

  return (
    <ShowSignupContext.Provider value={{ showShowSignup, setShowShowSignup }}>
      {children}
    </ShowSignupContext.Provider>
  )
}

export function useShowSignup() {
  return useContext(ShowSignupContext)
}