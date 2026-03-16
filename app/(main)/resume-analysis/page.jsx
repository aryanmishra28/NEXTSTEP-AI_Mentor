import { getResume } from "@/actions/resume";
import ResumeInsights from "./_components/resume-insights";

const parseStoredAnalysis = (feedback) => {
  if (!feedback) return { latest: null, history: [] };

  try {
    const parsed = JSON.parse(feedback);

    if (parsed?.latest && Array.isArray(parsed.history)) {
      return parsed;
    }

    if (parsed?.resumeAnalysis && parsed?.skillGapAnalysis) {
      return {
        latest: parsed,
        history: [
          {
            id: `${parsed.generatedAt}-${parsed.resumeAnalysis.score}`,
            generatedAt: parsed.generatedAt,
            algorithm: parsed.algorithm || "AI",
            atsScore: parsed.resumeAnalysis.score,
            alignmentScore: parsed.skillGapAnalysis.alignmentScore,
            overallVerdict: parsed.resumeAnalysis.overallVerdict,
            criticalGaps:
              parsed.skillGapAnalysis?.missingCriticalSkills?.length || 0,
            analysis: parsed,
          },
        ],
      };
    }

    return { latest: null, history: [] };
  } catch {
    return { latest: null, history: [] };
  }
};

export default async function ResumeAnalysisPage() {
  const resume = await getResume();
  const parsed = parseStoredAnalysis(resume?.feedback);

  return (
    <div className="container mx-auto py-6">
      <ResumeInsights
        initialAnalysis={parsed.latest}
        initialHistory={parsed.history}
        initialResumeContent={resume?.content || ""}
      />
    </div>
  );
}