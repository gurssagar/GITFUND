"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"


import { ChevronLeft, ChevronRight, Plus, X, MapPin, MessageCircle, Twitter, Linkedin, Wallet } from "lucide-react"
import { useSession } from "next-auth/react"

import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserSession {
  user?: {
    username?: string
    email?: string
    name?: string
    image?: string
  }
}
import { useSignup } from "../../context/SignupContext"
import { useShowSignup } from "../../context/showSignupContext"

interface FormData {
  metaMask: string
  location: string
  bio: string
  telegram: string
  twitter: string
  linkedin: string
  skills: string[]
  termsAccepted: boolean
}

const PROGRAMMING_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
  "Solidity",
  "Web3",
  "Blockchain",
  "Smart Contracts",
  "DeFi",
  "NFT",
  "Docker",
  "Kubernetes",
  "AWS",
  "MongoDB",
]

export default function MultiStepSignup() {
  const { data: session } = useSession() as { data: UserSession | null }
  const [showSignup, setSShowSignup] = useState(false)
  const { setShowSignup: setContextShowSignup } = useSignup()
  const [publicProfile, setPublicProfile] = useState()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    metaMask: "",
    location: "",
    bio: "",
    telegram: "",
    twitter: "",
    linkedin: "",
    skills: [],
    termsAccepted: false,
  })
  const [customSkill, setCustomSkill] = useState("")
  console.log(showSignup, "showSignup")
  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.username) return;
      
      try {
        const res = await fetch(
          `/api/publicProfile?username=${session.user.username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
          const data = await res.json();
          const userData = data.user[0];
          setPublicProfile(userData);
          console.log(userData, "userData")
          setSShowSignup(!userData?.formFilled);
          setContextShowSignup(userData?.formFilled);
        
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  });



  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      updateFormData("skills", [...formData.skills, skill])
    }
  }

  const removeSkill = (skill: string) => {
    updateFormData(
      "skills",
      formData.skills.filter((s) => s !== skill),
    )
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      addSkill(customSkill.trim())
      setCustomSkill("")
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.termsAccepted
      case 2:
        return formData.metaMask.trim() !== ""
      case 3:
        return formData.location.trim() !== "" && formData.bio.trim() !== ""
      case 4:
        return formData.skills.length > 0
      default:
        return false
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!session?.user) {
      setSubmitError("User session not available")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const postData = {
        ...formData,
        username: session.user.username,
        name: session.user.name,
        email: session.user.email
      }

      const res = await fetch('/api/publicProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (res.ok) {
        setSubmitSuccess(true)
        // Close signup after successful submission
        setTimeout(() => {
          setSShowSignup(false)
          setContextShowSignup(false)
        }, 2000)
      } else {
        const errorData = await res.json()
        setSubmitError(errorData.message || 'Failed to submit form')
      }
    } catch (error) {
      setSubmitError('Network error: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    {showSignup && (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-[10vh]">
        <div className="fixed inset-0 backdrop-blur-xl bg-black/30">
          <div className="z-50 fixed inset-0 flex items-center justify-center p-4">
              <div className="mx-auto w-full max-w-2xl ">
                <div className="text-center">
                  
                  <div className="flex justify-between  mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                       Personal Info
                      </h2>
                      <p className="text-neutral-400 mt-1">
                       Tell us about yourself
                      </p>
                    </div>
                    <div className="text-neutral-400">
                      Step {currentStep} of {totalSteps}
                    </div>
                  </div>
                  
                  <Progress value={progress} className="my-4" />
                </div>

                <div className="space-y-6">
                  {/* Step 1: Terms and Conditions */}
                  {currentStep === 1 && (
                    <>
                    
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-white mb-4">Terms and Conditions</h3>
                      </div>

                      <div className="bg-neutral-700 rounded-lg p-6 max-h-64 overflow-y-auto">
                        <div className="text-sm text-neutral-300 space-y-4">
                          <h4 className="font-semibold text-white">GitFund Platform Agreement</h4>

                          <p>
                            By joining GitFund, you agree to contribute to open-source projects and earn rewards based on your
                            contributions. This platform connects developers with meaningful projects and provides fair
                            compensation for quality work.
                          </p>

                          <h5 className="font-semibold text-white">Key Terms:</h5>
                          <ul className="list-disc list-inside space-y-2">
                            <li>You must provide accurate information in your profile</li>
                            <li>All contributions must be original work or properly attributed</li>
                            <li>Rewards are distributed based on contribution quality and impact</li>
                            <li>You retain ownership of your contributions while granting usage rights</li>
                            <li>Platform fees may apply to certain transactions</li>
                            <li>You agree to maintain professional conduct in all interactions</li>
                          </ul>

                          <h5 className="font-semibold text-white">Privacy:</h5>
                          <p>
                            Your personal information will be protected according to our privacy policy. We only collect
                            necessary information to facilitate project matching and payments.
                          </p>

                          <h5 className="font-semibold text-white">Wallet Integration:</h5>
                          <p>
                            By connecting your MetaMask wallet, you authorize secure transactions for receiving rewards and
                            participating in the GitFund ecosystem.
                          </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={formData.termsAccepted}
                          onCheckedChange={(checked) => updateFormData("termsAccepted", checked)}
                        />
                        <Label htmlFor="terms" className="text-sm text-neutral-300">
                          I have read and agree to the Terms and Conditions
                        </Label>
                      </div>
                    </>
                  
                  )}

                  {/* Step 2: Wallet Information */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <Wallet className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                        <p className="text-neutral-400">We need your MetaMask wallet address to process rewards</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="metamask" className="text-white">
                            MetaMask Wallet Address *
                          </Label>
                          <Input
                            id="metamask"
                            placeholder="0x..."
                            value={formData.metaMask}
                            onChange={(e) => updateFormData("metaMask", e.target.value)}
                            className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                          />
                          <p className="text-xs text-neutral-400 mt-1">
                            This address will be used to receive your contribution rewards
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Personal Information */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <MapPin className="mx-auto h-12 w-12 text-green-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Personal Information</h3>
                        <p className="text-neutral-400">Tell us about yourself and where you're based</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="location" className="text-white">
                            Location *
                          </Label>
                          <Input
                            id="location"
                            placeholder="e.g., San Francisco, CA"
                            value={formData.location}
                            onChange={(e) => updateFormData("location", e.target.value)}
                            className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                          />
                        </div>

                        <div>
                          <Label htmlFor="bio" className="text-white">
                            Bio *
                          </Label>
                          <Textarea
                            id="bio"
                            placeholder="Tell us about your experience, interests, and what motivates you to contribute to open source..."
                            value={formData.bio}
                            onChange={(e) => updateFormData("bio", e.target.value)}
                            className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400 min-h-[100px]"
                          />
                          <p className="text-xs text-neutral-400 mt-1">
                            This helps project maintainers understand your background
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Skills and Social Links */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-white mb-2">Skills & Social Links</h3>
                        <p className="text-neutral-400">Add your skills and social profiles (optional)</p>
                      </div>

                      <div className="space-y-6">
                        {/* Skills Section */}
                        <div>
                          <Label className="text-white mb-3 block">Skills *</Label>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {PROGRAMMING_SKILLS.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant={formData.skills.includes(skill) ? "default" : "outline"}
                                  className={`cursor-pointer transition-colors ${
                                    formData.skills.includes(skill)
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300 border-neutral-600"
                                  }`}
                                  onClick={() => (formData.skills.includes(skill) ? removeSkill(skill) : addSkill(skill))}
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <Input
                                placeholder="Add custom skill..."
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addCustomSkill()}
                                className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                              />
                              <Button
                                type="button"
                                onClick={addCustomSkill}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {formData.skills.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm text-neutral-400">Selected skills:</p>
                                <div className="flex flex-wrap gap-2">
                                  {formData.skills.map((skill) => (
                                    <Badge key={skill} className="bg-blue-600 text-white">
                                      {skill}
                                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeSkill(skill)} />
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Social Links */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="telegram" className="text-white flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Telegram
                            </Label>
                            <Input
                              id="telegram"
                              placeholder="@username"
                              value={formData.telegram}
                              onChange={(e) => updateFormData("telegram", e.target.value)}
                              className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                            />
                          </div>

                          <div>
                            <Label htmlFor="twitter" className="text-white flex items-center gap-2">
                              <Twitter className="h-4 w-4" />
                              Twitter
                            </Label>
                            <Input
                              id="twitter"
                              placeholder="@username"
                              value={formData.twitter}
                              onChange={(e) => updateFormData("twitter", e.target.value)}
                              className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                            />
                          </div>

                          <div>
                            <Label htmlFor="linkedin" className="text-white flex items-center gap-2">
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </Label>
                            <Input
                              id="linkedin"
                              placeholder="profile-url"
                              value={formData.linkedin}
                              onChange={(e) => updateFormData("linkedin", e.target.value)}
                              className="bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {currentStep < totalSteps ? (
                        <Button onClick={nextStep} disabled={!canProceed()} className="bg-blue-600 hover:bg-blue-700">
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={!canProceed() || isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? "Submitting..." : "Complete Signup"}
                        </Button>
                      )}
                  </div>
                  
                  {submitError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription className="text-red-300">
                        {submitError}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {submitSuccess && (
                    <Alert variant="default" className="mt-4 bg-green-600/20 border-green-600">
                      <AlertDescription className="text-green-300">
                        Profile submitted successfully! Closing in 2 seconds...
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
          </div>
        </div>
    </div>
  )
}
    
        </>
      )
    }
      
      
