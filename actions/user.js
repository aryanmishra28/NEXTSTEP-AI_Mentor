"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Do any slow external work before opening the transaction.
    const existingIndustryInsight = await db.industryInsight.findUnique({
      where: {
        industry: data.industry,
      },
    });

    let generatedInsights = null;
    if (!existingIndustryInsight) {
      generatedInsights = await generateAIInsights(data.industry);
    }

    // Keep the transaction focused on short DB operations only.
    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        if (!industryInsight) {
          if (!generatedInsights) {
            throw new Error("Industry insights changed during update, please retry");
          }

          try {
            industryInsight = await tx.industryInsight.create({
              data: {
                industry: data.industry,
                ...generatedInsights,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          } catch (error) {
            // Handle races where another request created the same industry first.
            if (error?.code === "P2002") {
              industryInsight = await tx.industryInsight.findUnique({
                where: {
                  industry: data.industry,
                },
              });
            } else {
              throw error;
            }
          }
        }

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      }
    );

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isOnboarded: false };
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    // Silence expected Next.js dynamic server usage during build-time static checks
    if (error?.digest !== "DYNAMIC_SERVER_USAGE") {
      console.error("Error checking onboarding status:", error);
    }
    return { isOnboarded: false };
  }
}
