"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Loader2,
  Radar,
  Sparkles,
  Target,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { analyzeResume, analyzeResumeDeterministic } from "@/actions/resume";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/use-fetch";
import ResumeImporter from "./resume-importer";

// Labels for the 4 diagnostic progress bars shown in the "Resume Diagnostic" card.
const scoreCards = [
  {
    key: "atsReadability",
    label: "ATS Readability",
  },
  {
    key: "impact",
    label: "Impact",
  },
  {
    key: "keywordAlignment",
    label: "Keyword Alignment",
  },
  {
    key: "structure",
    label: "Structure",
  },
];

const effortStyles = {
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  High: "bg-rose-100 text-rose-700 border-rose-200",
};

// Reusable UI block for chip-based lists (keywords, skills, etc.).
const SkillList = ({ title, items, emptyCopy }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items?.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyCopy}</p>
      )}
    </CardContent>
  </Card>
);

export default function ResumeInsights({
  initialAnalysis,
  initialHistory,
  initialResumeContent,
}) {
  // `analysis` powers the main report cards/charts shown in this page.
  const [analysis, setAnalysis] = useState(initialAnalysis);
  // `history` powers the analysis timeline/snapshot section.
  const [history, setHistory] = useState(initialHistory || []);
  // Gate: if user has no saved resume content, show import + helper state first.
  const [hasResumeContent, setHasResumeContent] = useState(
    Boolean(initialResumeContent?.trim())
  );

  // Server action hook: AI-based analysis.
  const {
    data,
    error,
    fn: analyzeResumeFn,
    loading,
  } = useFetch(analyzeResume);

  // Server action hook: deterministic in-house rules engine (no AI model call).
  const {
    data: deterministicData,
    error: deterministicError,
    fn: runDeterministicAnalysis,
    loading: deterministicLoading,
  } = useFetch(analyzeResumeDeterministic);

  // When AI analysis returns, refresh page-level report state.
  useEffect(() => {
    if (data?.latest) {
      setAnalysis(data.latest);
      setHistory(data.history || []);
      setHasResumeContent(true);
      toast.success("AI analysis updated");
    }
  }, [data]);

  // When rule-based analysis returns, refresh the same report state.
  useEffect(() => {
    if (deterministicData?.latest) {
      setAnalysis(deterministicData.latest);
      setHistory(deterministicData.history || []);
      setHasResumeContent(true);
      toast.success("Rule-based analysis updated");
    }
  }, [deterministicData]);

  // Error surface for AI analysis button.
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to analyze resume");
    }
  }, [error]);

  // Error surface for rule-based analysis button.
  useEffect(() => {
    if (deterministicError) {
      toast.error(deterministicError.message || "Failed to run rule-based analysis");
    }
  }, [deterministicError]);

  // Disable both run buttons while any analysis job is active.
  const isAnalyzing = loading || deterministicLoading;

  // Timestamp shown in the page header next to "Updated ...".
  const generatedAt = analysis?.generatedAt
    ? format(new Date(analysis.generatedAt), "dd MMM yyyy, hh:mm a")
    : null;

  const openHistorySnapshot = (entry) => {
    if (!entry?.analysis) {
      toast.error("Full details are not available for this snapshot");
      return;
    }

    setAnalysis(entry.analysis);
    toast.success("Loaded historical analysis snapshot");
  };

  // Top-level KPI cards (ATS, alignment, gaps) shown directly below the header.
  const overviewCards = useMemo(() => {
    if (!analysis) return [];

    return [
      {
        title: "ATS Score",
        value: analysis.resumeAnalysis.score,
        description: analysis.resumeAnalysis.overallVerdict,
        icon: Radar,
      },
      {
        title: "Skill Alignment",
        value: analysis.skillGapAnalysis.alignmentScore,
        description: "How closely your profile matches current market demand",
        icon: Target,
      },
      {
        title: "Critical Gaps",
        value: analysis.skillGapAnalysis.missingCriticalSkills.length,
        description: "High-value skills missing from your current profile",
        icon: Brain,
        suffix: " gaps",
      },
    ];
  }, [analysis]);

  if (!hasResumeContent) {
    return (
      <div className="space-y-6">
        {/* Frontend: upload/paste resume text before analysis is possible */}
        <ResumeImporter
          initialText={initialResumeContent}
          onResumeSaved={() => setHasResumeContent(true)}
        />

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Resume Analysis</CardTitle>
            <CardDescription>
              Save your resume content first, then run ATS and skill-gap checks.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground md:max-w-xl">
              The analyzer uses your saved resume, onboarding profile, and market
              insight data to evaluate keyword fit, structure, and missing skills.
            </p>
            <Button asChild>
              {/* Frontend nav: takes user to full resume builder */}
              <Link href="/resume">
                Open Resume Builder
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Frontend: resume text import utility (PDF/paste + save) */}
      <ResumeImporter
        initialText={initialResumeContent}
        onResumeSaved={() => setHasResumeContent(true)}
      />

      <div className="flex flex-col gap-4 rounded-2xl border bg-muted/40 p-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">New Feature</Badge>
            {generatedAt ? <Badge variant="secondary">Updated {generatedAt}</Badge> : null}
            {analysis?.algorithm ? (
              <Badge variant="outline">
                {analysis.algorithm === "RULE_BASED" ? "Our Algorithm" : "AI"}
              </Badge>
            ) : null}
          </div>
          <h1 className="text-4xl font-bold md:text-5xl gradient-title">
            Resume Analysis & Skill Gap Analyzer
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Measure ATS readiness, surface weak keywords, and identify the next
            skills to add based on your industry profile.
          </p>
        </div>

        <div className="flex gap-3">
          {/* Frontend action: go to builder for manual edits */}
          <Button variant="outline" asChild>
            <Link href="/resume">Edit Resume</Link>
          </Button>
          {/* Frontend action: trigger AI analysis server action */}
          <Button onClick={() => analyzeResumeFn()} disabled={isAnalyzing}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
          {/* Frontend action: trigger deterministic (non-AI) server action */}
          <Button
            variant="secondary"
            onClick={() => runDeterministicAnalysis()}
            disabled={isAnalyzing}
          >
            {deterministicLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Rules...
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" />
                Run Our Algorithm
              </>
            )}
          </Button>
        </div>
      </div>

      {history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5" />
              Analysis History
            </CardTitle>
            <CardDescription>
              Recent analysis runs saved for quick comparison.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Frontend list: each row is one saved analysis run */}
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {format(new Date(entry.generatedAt), "dd MMM yyyy, hh:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.overallVerdict}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">ATS {entry.atsScore}%</Badge>
                    <Badge variant="outline">
                      Alignment {entry.alignmentScore}%
                    </Badge>
                    <Badge variant="outline">
                      Gaps {entry.criticalGaps}
                    </Badge>
                    <Badge variant="outline">
                      {entry.algorithm === "RULE_BASED" ? "Our Algorithm" : "AI"}
                    </Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  // Loads this historical run into the main report section below.
                  onClick={() => openHistorySnapshot(entry)}
                >
                  View Snapshot
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {analysis ? (
        <>
          {/* Frontend: KPI summary cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {overviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <Card key={card.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {card.value}
                      {card.suffix || "%"}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Frontend: detailed score breakdown + role fit tags */}
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Resume Diagnostic</CardTitle>
                <CardDescription>{analysis.resumeAnalysis.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {scoreCards.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{item.label}</span>
                      <span>{analysis.resumeAnalysis.sectionScores[item.key]}%</span>
                    </div>
                    <Progress value={analysis.resumeAnalysis.sectionScores[item.key]} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Fit</CardTitle>
                <CardDescription>
                  Roles your current resume is closest to supporting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.resumeAnalysis.recommendedRoles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Frontend: qualitative strengths/risks from selected analysis */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Resume Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {analysis.resumeAnalysis.strengths.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Improvement Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {analysis.resumeAnalysis.risks.map((item) => (
                    <li key={item} className="flex gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Frontend: ATS gaps and practical ATS tips */}
          <div className="grid gap-4 lg:grid-cols-2">
            <SkillList
              title="Missing Keywords"
              items={analysis.resumeAnalysis.keywordGaps}
              emptyCopy="No major keyword gaps were flagged in the latest analysis."
            />
            <SkillList
              title="ATS Improvement Tips"
              items={analysis.resumeAnalysis.atsTips}
              emptyCopy="No ATS issues were detected in the latest run."
            />
          </div>

          {/* Frontend: skill inventory and gap buckets */}
          <div className="grid gap-4 lg:grid-cols-3">
            <SkillList
              title="Current Skills"
              items={analysis.skillGapAnalysis.currentSkills}
              emptyCopy="The analyzer could not validate skills from the latest resume snapshot."
            />
            <SkillList
              title="Critical Gaps"
              items={analysis.skillGapAnalysis.missingCriticalSkills}
              emptyCopy="No urgent market gaps were identified."
            />
            <SkillList
              title="Adjacent Skills"
              items={analysis.skillGapAnalysis.adjacentSkills}
              emptyCopy="No adjacent skill suggestions available yet."
            />
          </div>

          {/* Frontend: learning plan and immediate action checklist */}
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Learning Priorities</CardTitle>
                <CardDescription>
                  Focus areas selected for the highest near-term career return.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.skillGapAnalysis.learningPriorities.map((item) => (
                  <div
                    key={`${item.skill}-${item.reason}`}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">{item.skill}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.reason}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${effortStyles[item.effort]}`}
                      >
                        {item.effort} effort
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Practical actions you can take immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {analysis.skillGapAnalysis.nextSteps.map((item) => (
                    <li key={item} className="flex gap-3">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        // Fallback UI shown before first analysis run.
        <Card>
          <CardHeader>
            <CardTitle>Run Your First Analysis</CardTitle>
            <CardDescription>
              Generate an ATS-style review and a targeted skill-gap report from
              your saved resume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This report uses your resume content, onboarding data, and current
              industry insights to surface role fit, missing keywords, and the
              most valuable skills to add next.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}