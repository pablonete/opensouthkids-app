"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getKids() {
  const { data, error } = await supabase.from("kids").select("*").order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching kids:", error)
    return []
  }

  return data || []
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
    // Get and increment counter
    const { data: counterData, error: counterError } = await supabase
      .from("registration_counter")
      .select("counter")
      .eq("id", 1)
      .single()

    if (counterError) {
      console.error("Error fetching counter:", counterError)
      return { error: "Registration failed. Please try again." }
    }

    const currentCounter = counterData.counter

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
