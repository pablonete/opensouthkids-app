"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Sparkles, Star, RefreshCw } from "lucide-react"
import { getKids, registerKid } from "./actions"
import type { Kid } from "@/lib/supabase"

export default function KidsRegistration() {
  const [kids, setKids] = useState<Kid[]>([])
  const [nickname, setNickname] = useState("")
  const [age, setAge] = useState<number>(8)
  const [sex, setSex] = useState<"boy" | "girl" | "other" | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Load kids on component mount
  useEffect(() => {
    loadKids()
  }, [])

  const loadKids = async () => {
    setIsLoading(true)
    try {
      const kidsData = await getKids()
      setKids(kidsData)
    } catch (error) {
      console.error("Error loading kids:", error)
      setError("Failed to load registrations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const formData = new FormData()
    formData.append("nickname", nickname)
    formData.append("age", age.toString())
    formData.append("sex", sex || "")

    startTransition(async () => {
      const result = await registerKid(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(`Welcome! Your registration number is ${result.registrationNumber}`)
        setNickname("")
        setAge(8)
        setSex(null)
        // Reload kids list
        await loadKids()
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-2xl text-purple-600 font-bold flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4 md:p-8">
      <header className="text-center mb-8">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-purple-600 mb-2"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          OpenSouthKids 2025
        </motion.h1>
        <motion.div
          className="text-xl text-blue-500 flex items-center justify-center gap-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Sparkles className="h-5 w-5" />
          <span>Sign In Here!</span>
          <Sparkles className="h-5 w-5" />
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left side: List of registered kids */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-yellow-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-pink-500 flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-400" />
              {kids.length} {kids.length === 1 ? "Kid" : "Kids"}
            </h2>
            <Button
              onClick={loadKids}
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
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {kids.map((kid) => (
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
                    <div className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-mono font-bold text-yellow-800">
                      {kid.registration_number}
                    </div>
                  </div>
                </motion.div>
              ))}
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

            {/* Success message */}
            {success && (
              <div className="bg-green-100 text-green-600 p-3 rounded-lg text-center font-bold">{success}</div>
            )}

            {/* Error message */}
            {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-center">{error}</div>}

            {/* Submit button */}
            <motion.div whileHover={{ scale: isPending ? 1 : 1.05 }} whileTap={{ scale: isPending ? 1 : 0.95 }}>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-16 text-xl font-bold rounded-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white disabled:opacity-50"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Registering...
                  </div>
                ) : (
                  "Register Me! 🎉"
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  )
}
