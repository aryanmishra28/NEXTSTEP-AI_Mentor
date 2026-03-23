import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";

export default async function OnboardingPage() {
  let isOnboarded = false;

  try {
    // Check if user is already onboarded
    const status = await getUserOnboardingStatus();
    isOnboarded = status.isOnboarded;
  } catch (error) {
    console.error("Error in onboarding page:", error);
    // Continue to onboarding form even if there's an error
  }

  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <OnboardingForm industries={industries} />
    </main>
  );
}
