"use client"

import { Button } from "./ui/button"
import { useSignup } from "../context/SignupContext"

export function SignupButton() {
  const { showSignup, setShowSignup } = useSignup()

  return (
    <Button 
      onClick={() => setShowSignup(!showSignup)}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {showSignup ? 'Hide Signup' : 'Show Signup'}
    </Button>
  )
}