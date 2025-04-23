import { handlers } from "../../../../../auth" 
export const { GET, POST } = handlers

// Add the required generateStaticParams function for static export
export function generateStaticParams() {
  return [{ nextauth: ['session', 'signin', 'signout', 'callback', 'verify-request', 'error'] }]
}