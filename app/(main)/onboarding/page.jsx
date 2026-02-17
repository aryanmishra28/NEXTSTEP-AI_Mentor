import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";

export default async function OnboardingPage() {
  try {
    // Check if user is already onboarded
    const { isOnboarded } = await getUserOnboardingStatus();

    if (isOnboarded) {
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("Error in onboarding page:", error);
    // Continue to onboarding form even if there's an error
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <OnboardingForm industries={industries} />
    </main>
  );
}
