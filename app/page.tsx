"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Sparkles, Star, RefreshCw, AlertCircle, Database, X, ChevronDown, Clock } from "lucide-react"
import { getKids, registerKid, checkDatabaseSetup } from "./actions"
import type { Kid } from "@/lib/supabase"

export default function KidsRegistration() {
  const [kids, setKids] = useState<Kid[]>([])
  const [showAllKids, setShowAllKids] = useState(false)
  const [nickname, setNickname] = useState("")
  const [age, setAge] = useState<number>(8)
  const [sex, setSex] = useState<"boy" | "girl" | "other" | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<{
    nickname: string
    age: number
    sex: "boy" | "girl" | "other"
  } | null>(null)
  const [databaseStatus, setDatabaseStatus] = useState({
    tablesExist: false,
    hasData: false,
    kidsCount: 0,
    nextRegistrationNumber: 1,
  })

  // Load kids and check database setup on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [kidsData, dbStatus] = await Promise.all([getKids(), checkDatabaseSetup()])
      setKids(kidsData)
      setDatabaseStatus(dbStatus)
      // Reset to show only first 6 kids on reload
      setShowAllKids(false)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate input
    if (!nickname?.trim()) {
      setError("Please enter your nickname!")
      return
    }

    if (!sex) {
      setError("Please select if you're a boy, girl, or other!")
      return
    }

    if (!age || age < 1 || age > 99) {
      setError("Please enter a valid age!")
      return
    }

    // Show confirmation modal instead of directly registering
    setPendingRegistration({
      nickname: nickname.trim(),
      age,
      sex,
    })
    setShowConfirmModal(true)
  }

  const handleConfirmRegistration = async () => {
    if (!pendingRegistration) return

    const formData = new FormData()
    formData.append("nickname", pendingRegistration.nickname)
    formData.append("age", pendingRegistration.age.toString())
    formData.append("sex", pendingRegistration.sex)

    startTransition(async () => {
      const result = await registerKid(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setNickname("")
        setAge(8)
        setSex(null)
        // Reload data
        await loadData()
      }

      // Close modal and clear pending registration
      setShowConfirmModal(false)
      setPendingRegistration(null)
    })
  }

  const handleCancelRegistration = () => {
    setShowConfirmModal(false)
    setPendingRegistration(null)
  }

  // Generate preview registration number for the modal
  const getPreviewRegistrationNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const counter = databaseStatus.nextRegistrationNumber.toString().padStart(3, "0")
    return `K${year}${month}${day}${counter}`
  }

  // Format time to 24h format (HH:MM)
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  // Get the kids to display (first 6 or all)
  const displayedKids = showAllKids ? kids : kids.slice(0, 6)
  const hasMoreKids = kids.length > 6

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-2xl text-green-600 font-bold flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  // Show setup instructions if database tables don't exist
  if (!databaseStatus.tablesExist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-2">OpenSouthKids 2025</h1>
            <div className="text-xl text-blue-500 flex items-center justify-center gap-2">
              <Database className="h-5 w-5" />
              <span>Database Setup Required</span>
            </div>
          </header>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-4 border-orange-300">
            <div className="flex items-center gap-4 mb-6">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-orange-600">Setup Required</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="text-lg">The database tables haven't been created yet. Please follow these steps:</p>

              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3">Step 1: Create Supabase Account</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>
                    Go to{" "}
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">
                      supabase.com
                    </a>
                  </li>
                  <li>Create a free account and new project</li>
                  <li>Copy your project URL and anon key</li>
                </ol>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="font-bold text-green-800 mb-3">Step 2: Set Environment Variables</h3>
                <div className="space-y-2 text-green-700">
                  <p>Add these to your environment variables:</p>
                  <code className="block bg-green-100 p-2 rounded text-sm">
                    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
                    <br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
                  </code>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-purple-800 mb-3">Step 3: Run Database Scripts</h3>
                <p className="text-purple-700 mb-3">In your Supabase SQL editor, run these scripts in order:</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => window.open("https://supabase.com/dashboard/project/_/sql", "_blank")}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Open Supabase SQL Editor
                  </Button>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button onClick={loadData} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Check Setup Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-4 md:p-8">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <img
            src="/placeholder.svg?height=60&width=60"
            alt="OpenSouthCode Logo"
            className="h-12 w-12 md:h-15 md:w-15"
          />
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-green-600"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            OpenSouthKids 2025
          </motion.h1>
        </div>
        <motion.div
          className="text-xl text-blue-500 flex items-center justify-center gap-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Sparkles className="h-5 w-5" />
          <span>This is public, do not write your full name</span>
          <Sparkles className="h-5 w-5" />
        </motion.div>
      </header>

      {/* Conference Over Banner */}
      <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-8 text-center">
        <div className="text-red-800 font-bold text-xl mb-2">🎉 Conference Complete! 🎉</div>
        <div className="text-red-700 text-lg">The 2025 conference is over. See you in 2026!</div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600 text-center">Confirm Registration</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-center text-gray-600">This is how your card will appear in the list:</p>

            {/* Preview Card */}
            {pendingRegistration && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-blue-200"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0 mt-1">
                    {pendingRegistration.sex === "boy" && "👦"}
                    {pendingRegistration.sex === "girl" && "👧"}
                    {pendingRegistration.sex === "other" && "🌈"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-blue-600">{pendingRegistration.nickname}</h3>
                    <div className="text-sm text-gray-600">Age: {pendingRegistration.age}</div>
                  </div>
                  <div className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-mono font-bold text-yellow-800">
                    {getPreviewRegistrationNumber()}
                  </div>
                </div>
              </motion.div>
            )}

            <p className="text-center text-sm text-gray-500">Is this information correct?</p>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCancelRegistration}
                variant="outline"
                className="flex-1 h-12 text-lg border-2 border-red-300 text-red-600 hover:bg-red-50"
                disabled={isPending}
              >
                <X className="h-5 w-5 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRegistration}
                className="flex-1 h-12 text-lg bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed"
                disabled={true}
              >
                <X className="h-5 w-5 mr-2" />
                Registration Closed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left side: List of registered kids */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-yellow-300 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-pink-500 flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-400" />
              {kids.length} {kids.length === 1 ? "Kid" : "Kids"}
              {!showAllKids && hasMoreKids && (
                <span className="text-sm font-normal text-gray-500 ml-2">(showing {Math.min(6, kids.length)})</span>
              )}
            </h2>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="text-pink-500 border-pink-300 hover:bg-pink-50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {kids.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No kids registered yet. Be the first one!</div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {displayedKids.map((kid) => (
                  <motion.div
                    key={kid.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-blue-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0 mt-1">
                        {kid.sex === "boy" && "👦"}
                        {kid.sex === "girl" && "👧"}
                        {kid.sex === "other" && "🌈"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-blue-600">{kid.nickname}</h3>
                        <div className="text-sm text-gray-600">Age: {kid.age}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-mono font-bold text-yellow-800">
                          {kid.registration_number}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(kid.created_at)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Show All / Show Less Button */}
              {hasMoreKids && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => setShowAllKids(!showAllKids)}
                    variant="outline"
                    className="w-full text-pink-600 border-pink-300 hover:bg-pink-50"
                  >
                    {showAllKids ? (
                      <>
                        Show Less
                        <ChevronDown className="h-4 w-4 ml-2 rotate-180" />
                      </>
                    ) : (
                      <>
                        Show All {kids.length} Kids
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side: Registration form */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-green-300">
          <h2 className="text-2xl font-bold text-green-500 mb-4 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-green-400" />
            Sign In Here!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname input */}
            <div>
              <Label htmlFor="nickname" className="text-lg text-purple-600 font-bold">
                What's your nickname?
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-2 text-lg h-12 rounded-xl border-2 border-purple-300 focus:border-purple-500"
                placeholder="Type your nickname here"
                disabled={isPending}
              />
            </div>

            {/* Age selection */}
            <div>
              <Label htmlFor="age" className="text-lg text-blue-600 font-bold">
                How old are you?
              </Label>
              <div className="mt-2 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-lg font-bold text-blue-600">{age} years old</span>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Math.max(1, Math.min(99, Number.parseInt(e.target.value) || 1)))}
                    className="w-20 h-8 text-center border-2 border-blue-300"
                    min="1"
                    max="99"
                    disabled={isPending}
                  />
                </div>
                <input
                  type="range"
                  id="age"
                  min="5"
                  max="15"
                  value={Math.min(15, Math.max(5, age))}
                  onChange={(e) => setAge(Number.parseInt(e.target.value))}
                  className="w-full h-8 accent-blue-500"
                  disabled={isPending}
                />
                <div className="flex justify-between text-sm text-blue-600 mt-1">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                </div>
                <div className="text-xs text-blue-500 mt-2 text-center">
                  Use the slider for ages 5-15, or type any age in the box above
                </div>
              </div>
            </div>

            {/* Sex selection with picture buttons */}
            <div>
              <Label className="text-lg text-pink-600 font-bold block mb-3">Are you a boy or a girl?</Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  onClick={() => setSex("boy")}
                  disabled={isPending}
                  className={`h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    sex === "boy" ? "bg-blue-500 border-4 border-blue-300" : "bg-blue-100 hover:bg-blue-200"
                  }`}
                >
                  <div className="text-4xl mb-1">👦</div>
                  <div className={sex === "boy" ? "text-white font-bold" : "text-blue-700"}>Boy</div>
                </Button>

                <Button
                  type="button"
                  onClick={() => setSex("girl")}
                  disabled={isPending}
                  className={`h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    sex === "girl" ? "bg-pink-500 border-4 border-pink-300" : "bg-pink-100 hover:bg-pink-200"
                  }`}
                >
                  <div className="text-4xl mb-1">👧</div>
                  <div className={sex === "girl" ? "text-white font-bold" : "text-pink-700"}>Girl</div>
                </Button>

                <Button
                  type="button"
                  onClick={() => setSex("other")}
                  disabled={isPending}
                  className={`h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    sex === "other" ? "bg-purple-500 border-4 border-purple-300" : "bg-purple-100 hover:bg-purple-200"
                  }`}
                >
                  <div className="text-4xl mb-1">🌈</div>
                  <div className={sex === "other" ? "text-white font-bold" : "text-purple-700"}>Other</div>
                </Button>
              </div>
            </div>

            {/* Error message */}
            {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-center">{error}</div>}

            {/* Submit button */}
            <motion.div whileHover={{ scale: 1 }} whileTap={{ scale: 1 }}>
              <Button
                type="submit"
                disabled={true}
                className="w-full h-16 text-xl font-bold rounded-xl bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed opacity-75"
              >
                Registration Closed 🔒
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  )
}
