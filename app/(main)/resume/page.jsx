import { getResume } from "@/actions/resume";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ResumeBuilder from "./_components/resume-builder";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-muted/40 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Resume Analysis</h2>
          <p className="text-sm text-muted-foreground md:max-w-2xl">
            Run an ATS-style resume review and compare your current profile to
            the skills your market is actively rewarding.
          </p>
        </div>
        <Button asChild>
          <Link href="/resume-analysis">Open Analyzer</Link>
        </Button>
      </div>
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
