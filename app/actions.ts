"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getKids() {
  try {
    const { data, error } = await supabase.from("kids").select("*").order("created_at", { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array instead of throwing error
      if (error.message.includes("does not exist")) {
        console.log("Kids table does not exist yet. Please run the database setup scripts.")
        return []
      }
      console.error("Error fetching kids:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching kids:", error)
    return []
  }
}

export async function registerKid(formData: FormData) {
  const nickname = formData.get("nickname") as string
  const age = Number.parseInt(formData.get("age") as string)
  const sex = formData.get("sex") as "boy" | "girl" | "other"

  // Validate input
  if (!nickname?.trim()) {
    return { error: "Please enter your nickname!" }
  }

  if (!sex) {
    return { error: "Please select if you're a boy, girl, or other!" }
  }

  if (!age || age < 1 || age > 99) {
    return { error: "Please enter a valid age!" }
  }

  try {
    // Check if tables exist by trying to get counter
    const { data: counterData, error: counterError } = await supabase
      .from("registration_counter")
      .select("counter")
      .eq("id", 1)
      .single()

    if (counterError) {
      if (counterError.message.includes("does not exist")) {
        return { error: "Database not set up. Please run the setup scripts first." }
      }
      console.error("Error fetching counter:", counterError)
      return { error: "Registration failed. Please try again." }
    }

    const currentCounter = counterData?.counter || 1

    // Generate registration number
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const counter = currentCounter.toString().padStart(3, "0")
    const registrationNumber = `K${year}${month}${day}${counter}`

    // Insert new kid
    const { error: insertError } = await supabase.from("kids").insert({
      nickname: nickname.trim(),
      age,
      sex,
      registration_number: registrationNumber,
    })

    if (insertError) {
      if (insertError.message.includes("does not exist")) {
        return { error: "Database not set up. Please run the setup scripts first." }
      }
      console.error("Error inserting kid:", insertError)
      return { error: "Registration failed. Please try again." }
    }

    // Update counter
    const { error: updateError } = await supabase
      .from("registration_counter")
      .update({
        counter: currentCounter + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)

    if (updateError) {
      console.error("Error updating counter:", updateError)
      // Don't return error here as the kid was already registered
    }

    revalidatePath("/")
    return { success: true, registrationNumber }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "Registration failed. Please try again." }
  }
}

export async function checkDatabaseSetup() {
  try {
    // Try to query both tables to check if they exist
    const [kidsResult, counterResult] = await Promise.all([
      supabase.from("kids").select("count", { count: "exact", head: true }),
      supabase.from("registration_counter").select("counter").eq("id", 1).single(),
    ])

    const tablesExist = !kidsResult.error && !counterResult.error
    const hasData = counterResult.data?.counter > 1

    return {
      tablesExist,
      hasData,
      kidsCount: kidsResult.count || 0,
      nextRegistrationNumber: counterResult.data?.counter || 1,
    }
  } catch (error) {
    return {
      tablesExist: false,
      hasData: false,
      kidsCount: 0,
      nextRegistrationNumber: 1,
    }
  }
}
