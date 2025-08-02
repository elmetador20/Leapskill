// actions/resume.js
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function ensureUserExists(userId) {
  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    // Try to create the user if it doesn't exist
    try {
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: '', // This will be updated by webhook
          name: null,
          imageUrl: null
        }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("User not found and could not be created. Please sign out and sign in again.");
    }
  }

  return user;
}

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  try {
    return await db.resume.findUnique({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return null; // Return null instead of throwing error
  }
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUserExists(userId);

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry || 'professional'} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}