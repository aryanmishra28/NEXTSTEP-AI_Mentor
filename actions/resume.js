"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

const AI_MODEL = "gemini-2.5-flash";
const MAX_ANALYSIS_HISTORY_ITEMS = 10;
const ANALYSIS_SOURCE = {
  AI: "AI",
  RULE_BASED: "RULE_BASED",
};

// Common action verbs used by the rule-based analyzer to detect achievement-oriented writing.
const ACTION_VERBS = [
  "led",
  "built",
  "designed",
  "implemented",
  "created",
  "launched",
  "optimized",
  "improved",
  "managed",
  "delivered",
  "developed",
  "automated",
  "scaled",
  "reduced",
  "increased",
  "analyzed",
  "collaborated",
  "owned",
  "mentored",
  "architected",
];

const cleanJsonResponse = (text) =>
  text.replace(/```(?:json)?\n?/g, "").trim();

const clampScore = (value) => {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return 0;
  return Math.max(0, Math.min(100, Math.round(numericValue)));
};

const sanitizeStringArray = (values) =>
  [...new Set((values || []).map((value) => String(value).trim()).filter(Boolean))];

const normalizeLearningPriorities = (items) =>
  (items || [])
    .map((item) => ({
      skill: String(item?.skill || "").trim(),
      reason: String(item?.reason || "").trim(),
      effort: ["Low", "Medium", "High"].includes(item?.effort)
        ? item.effort
        : "Medium",
    }))
    .filter((item) => item.skill && item.reason);

const normalizeResumeInsights = (analysis) => ({
  // Unified shape consumed by frontend regardless of source (AI or RULE_BASED).
  generatedAt: analysis?.generatedAt || new Date().toISOString(),
  algorithm:
    analysis?.algorithm === ANALYSIS_SOURCE.RULE_BASED
      ? ANALYSIS_SOURCE.RULE_BASED
      : ANALYSIS_SOURCE.AI,
  resumeAnalysis: {
    score: clampScore(analysis?.resumeAnalysis?.score),
    overallVerdict: String(analysis?.resumeAnalysis?.overallVerdict || "").trim(),
    summary: String(analysis?.resumeAnalysis?.summary || "").trim(),
    strengths: sanitizeStringArray(analysis?.resumeAnalysis?.strengths),
    risks: sanitizeStringArray(analysis?.resumeAnalysis?.risks),
    keywordGaps: sanitizeStringArray(analysis?.resumeAnalysis?.keywordGaps),
    atsTips: sanitizeStringArray(analysis?.resumeAnalysis?.atsTips),
    recommendedRoles: sanitizeStringArray(
      analysis?.resumeAnalysis?.recommendedRoles
    ),
    sectionScores: {
      atsReadability: clampScore(
        analysis?.resumeAnalysis?.sectionScores?.atsReadability
      ),
      impact: clampScore(analysis?.resumeAnalysis?.sectionScores?.impact),
      keywordAlignment: clampScore(
        analysis?.resumeAnalysis?.sectionScores?.keywordAlignment
      ),
      structure: clampScore(analysis?.resumeAnalysis?.sectionScores?.structure),
    },
  },
  skillGapAnalysis: {
    alignmentScore: clampScore(analysis?.skillGapAnalysis?.alignmentScore),
    currentSkills: sanitizeStringArray(analysis?.skillGapAnalysis?.currentSkills),
    missingCriticalSkills: sanitizeStringArray(
      analysis?.skillGapAnalysis?.missingCriticalSkills
    ),
    adjacentSkills: sanitizeStringArray(analysis?.skillGapAnalysis?.adjacentSkills),
    learningPriorities: normalizeLearningPriorities(
      analysis?.skillGapAnalysis?.learningPriorities
    ),
    nextSteps: sanitizeStringArray(analysis?.skillGapAnalysis?.nextSteps),
  },
});

const getAnalysisHistoryEntry = (analysis) => ({
  // Compact history row used for timeline cards, with full snapshot attached.
  id: `${analysis.generatedAt}-${analysis.resumeAnalysis.score}`,
  generatedAt: analysis.generatedAt,
  algorithm: analysis.algorithm || ANALYSIS_SOURCE.AI,
  atsScore: analysis.resumeAnalysis.score,
  alignmentScore: analysis.skillGapAnalysis.alignmentScore,
  overallVerdict: analysis.resumeAnalysis.overallVerdict,
  criticalGaps: analysis.skillGapAnalysis.missingCriticalSkills.length,
  analysis,
});

const toAnalysisEnvelope = (payload) => {
  if (!payload) return { latest: null, history: [] };

  if (payload.latest && Array.isArray(payload.history)) {
    return {
      latest: payload.latest,
      history: payload.history,
    };
  }

  if (payload.resumeAnalysis && payload.skillGapAnalysis) {
    const latest = payload;
    return {
      latest,
      history: [getAnalysisHistoryEntry(latest)],
    };
  }

  return { latest: null, history: [] };
};

const parseFeedbackEnvelope = (feedback) => {
  // Backward compatibility: safely handle legacy and current feedback payload formats.
  if (!feedback) return { latest: null, history: [] };

  try {
    const parsed = JSON.parse(feedback);
    return toAnalysisEnvelope(parsed);
  } catch {
    return { latest: null, history: [] };
  }
};

const normalizeImportedResumeText = (text) =>
  String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const tokenizeLower = (text) =>
  String(text || "")
    .toLowerCase()
    .match(/[a-z0-9+#.]+/g) || [];

const uniqueTokens = (text) => [...new Set(tokenizeLower(text))];

const containsHeading = (text, heading) =>
  new RegExp(`(^|\\n)\\s{0,3}(#{1,3}\\s*)?${heading}\\b`, "i").test(text);

const pickEffortBySkillName = (skill) => {
  const lower = skill.toLowerCase();
  if (/(system|architecture|distributed|kubernetes|security|machine|data platform)/.test(lower)) {
    return "High";
  }
  if (/(react|next|node|sql|testing|api|docker|typescript)/.test(lower)) {
    return "Medium";
  }
  return "Low";
};

const scoreToVerdict = (score) => {
  if (score >= 85) return "Excellent readiness for interviews and ATS filters.";
  if (score >= 70) return "Strong resume with a few high-impact improvements needed.";
  if (score >= 55) return "Moderate readiness. Improve structure and skill alignment.";
  return "Foundational draft. Prioritize clarity, quantified impact, and relevant keywords.";
};

const buildAnalysisPayload = (existingFeedback, normalizedAnalysis) => {
  // Keep latest run first and retain a bounded history for UI performance.
  const existingEnvelope = parseFeedbackEnvelope(existingFeedback);

  const newHistory = [
    getAnalysisHistoryEntry(normalizedAnalysis),
    ...existingEnvelope.history.filter(
      (item) => item.generatedAt !== normalizedAnalysis.generatedAt
    ),
  ].slice(0, MAX_ANALYSIS_HISTORY_ITEMS);

  return {
    latest: normalizedAnalysis,
    history: newHistory,
  };
};

const saveAnalysisPayload = async ({ user, normalizedAnalysis }) => {
  // Single persistence path shared by both AI and deterministic analysis modes.
  const feedbackPayload = buildAnalysisPayload(
    user.resume.feedback,
    normalizedAnalysis
  );

  await db.resume.update({
    where: {
      userId: user.id,
    },
    data: {
      atsScore: normalizedAnalysis.resumeAnalysis.score,
      feedback: JSON.stringify(feedbackPayload),
    },
  });

  revalidatePath("/resume");
  revalidatePath("/resume-analysis");
  revalidatePath("/dashboard");

  return feedbackPayload;
};


export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

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
    revalidatePath("/resume-analysis");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function saveImportedResumeText(rawText) {
  const content = normalizeImportedResumeText(rawText);

  if (!content) {
    throw new Error("Resume text is empty");
  }

  if (content.length < 250) {
    throw new Error("Resume text is too short to analyze");
  }

  const savedResume = await saveResume(content);
  return {
    id: savedResume.id,
    contentLength: content.length,
  };
}

export async function extractResumeTextFromPdf({ fileName, base64Data }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!base64Data) {
    throw new Error("PDF data is required");
  }

  const byteLength = Buffer.byteLength(base64Data, "base64");
  const maxFileSizeInBytes = 8 * 1024 * 1024;

  if (byteLength > maxFileSizeInBytes) {
    throw new Error("PDF is too large. Please upload a file under 8MB");
  }

  try {
    const pdfBuffer = Buffer.from(base64Data, "base64");
    const pdfParseModule = await import("pdf-parse");
    const parsePdf = pdfParseModule.default || pdfParseModule;
    const parsed = await parsePdf(pdfBuffer);
    const cleanedText = normalizeImportedResumeText(parsed.text);

    if (!cleanedText) {
      throw new Error("Could not extract text from this PDF");
    }

    return {
      fileName: fileName || "resume.pdf",
      text: cleanedText,
      textLength: cleanedText.length,
    };
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to read PDF. Try another file or paste text");
  }
}

export async function improveWithAI({ current, type }) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: AI_MODEL });

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
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

export async function analyzeResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
      resume: true,
    },
  });

  if (!user) throw new Error("User not found");
  if (!user.resume?.content?.trim()) {
    throw new Error("Create and save your resume before running analysis");
  }

  let industryInsight = user.industryInsight;

  // Do not block analysis when onboarding is incomplete.
  // If industry exists, bootstrap missing insight once; otherwise use generic context.
  if (!industryInsight && user.industry) {
    try {
      const generatedInsights = await generateAIInsights(user.industry);
      industryInsight = await db.industryInsight.upsert({
        where: {
          industry: user.industry,
        },
        update: {
          ...generatedInsights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(),
        },
        create: {
          industry: user.industry,
          ...generatedInsights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (insightError) {
      console.error("Error creating fallback industry insight:", insightError);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Server not configured: missing API key");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: AI_MODEL });

  const industryLabel = user.industry || "general";
  const marketSkills = sanitizeStringArray([
    ...(user.skills || []),
    ...(industryInsight?.topSkills || []),
    ...(industryInsight?.recommendedSkills || []),
  ]);
  const marketTrends = sanitizeStringArray(industryInsight?.keyTrends || []);

  const prompt = `
    You are an expert ATS reviewer and career strategist.
    Analyze the user's resume and compare their current profile to market demand.

    User profile:
    - Industry: ${industryLabel}
    - Years of experience: ${user.experience ?? "Unknown"}
    - Declared skills: ${sanitizeStringArray(user.skills).join(", ") || "None"}
    - Market skills to benchmark against: ${marketSkills.join(", ") || "Not available"}
    - Market trends: ${marketTrends.join(", ") || "Not available"}

    Resume content:
    ${user.resume.content}

    Return ONLY valid JSON in this exact shape:
    {
      "generatedAt": "ISO-8601 string",
      "resumeAnalysis": {
        "score": 0,
        "overallVerdict": "short sentence",
        "summary": "2-3 sentence assessment",
        "strengths": ["string"],
        "risks": ["string"],
        "keywordGaps": ["string"],
        "atsTips": ["string"],
        "recommendedRoles": ["string"],
        "sectionScores": {
          "atsReadability": 0,
          "impact": 0,
          "keywordAlignment": 0,
          "structure": 0
        }
      },
      "skillGapAnalysis": {
        "alignmentScore": 0,
        "currentSkills": ["string"],
        "missingCriticalSkills": ["string"],
        "adjacentSkills": ["string"],
        "learningPriorities": [
          {
            "skill": "string",
            "reason": "string",
            "effort": "Low"
          }
        ],
        "nextSteps": ["string"]
      }
    }

    Rules:
    - Scores must be integers from 0 to 100.
    - Keep arrays concise and high-signal.
    - Identify ATS issues, weak keywords, and missing skills honestly.
    - If market signals are unavailable, infer reasonable skill gaps from resume evidence and common role expectations.
    - currentSkills should reflect skills evident in the resume plus validated profile skills.
    - missingCriticalSkills should focus on the highest-value gaps for this industry.
    - adjacentSkills should be reasonable next skills based on current experience.
    - learningPriorities must contain 3 to 5 items.
    - nextSteps must contain practical actions the user can take this week.
    - Do not include markdown fences or commentary.
  `;

  try {
    // AI path: model returns structured JSON which is normalized and persisted.
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const parsedAnalysis = JSON.parse(cleanJsonResponse(rawText));
    const normalizedAnalysis = normalizeResumeInsights({
      ...parsedAnalysis,
      algorithm: ANALYSIS_SOURCE.AI,
    });

    return await saveAnalysisPayload({ user, normalizedAnalysis });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume");
  }
}

export async function analyzeResumeDeterministic() {
  // Deterministic path: no LLM call. All scoring is computed via explicit rules.
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
      resume: true,
    },
  });

  if (!user) throw new Error("User not found");
  if (!user.resume?.content?.trim()) {
    throw new Error("Create and save your resume before running analysis");
  }

  const resumeText = user.resume.content;
  const lowerText = resumeText.toLowerCase();
  const tokens = uniqueTokens(resumeText);
  const tokenSet = new Set(tokens);

  const lines = resumeText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const bulletLines = lines.filter((line) => /^[-*\u2022]/.test(line));
  const words = resumeText.split(/\s+/).filter(Boolean);
  const avgWordsPerLine = lines.length
    ? words.length / lines.length
    : words.length;
  const numericMatches = resumeText.match(/\b\d+(?:\.\d+)?%?\b/g) || [];

  // Section detection influences structure/readability scoring and recommendations.
  const headingChecks = {
    summary: containsHeading(lowerText, "professional summary|summary|profile"),
    skills: containsHeading(lowerText, "skills|technical skills"),
    experience: containsHeading(
      lowerText,
      "experience|work experience|professional experience"
    ),
    education: containsHeading(lowerText, "education"),
    projects: containsHeading(lowerText, "projects"),
  };

  const headingCount = Object.values(headingChecks).filter(Boolean).length;
  const actionVerbMatches = ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, "i").test(lowerText)
  );

  // Market benchmark is still useful in non-AI mode for skill-gap detection.
  const benchmarkSkills = sanitizeStringArray([
    ...(user.skills || []),
    ...(user.industryInsight?.topSkills || []),
    ...(user.industryInsight?.recommendedSkills || []),
  ]);

  const currentSkills = benchmarkSkills.filter((skill) => {
    const wordsInSkill = skill.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
    return wordsInSkill.every((part) => tokenSet.has(part));
  });

  const missingCriticalSkills = benchmarkSkills
    .filter((skill) => !currentSkills.includes(skill))
    .slice(0, 8);

  const adjacentSkills = benchmarkSkills
    .filter((skill) => !currentSkills.includes(skill))
    .slice(8, 14);

  // Four explicit score dimensions shown in frontend progress bars.
  const atsReadability = clampScore(
    40 + (bulletLines.length >= 6 ? 20 : bulletLines.length * 3) +
      (avgWordsPerLine >= 6 && avgWordsPerLine <= 20 ? 20 : 8) +
      headingCount * 4
  );

  const impact = clampScore(
    30 + Math.min(25, numericMatches.length * 4) +
      Math.min(25, actionVerbMatches.length * 3) +
      (lowerText.includes("result") || lowerText.includes("impact") ? 10 : 0)
  );

  const keywordAlignment = clampScore(
    benchmarkSkills.length
      ? (currentSkills.length / benchmarkSkills.length) * 100
      : 55
  );

  const structure = clampScore(35 + headingCount * 10 + (lines.length > 20 ? 15 : 0));

  const overallScore = clampScore(
    atsReadability * 0.3 +
      impact * 0.3 +
      keywordAlignment * 0.25 +
      structure * 0.15
  );

  // Explainable strengths/risks built from deterministic signals.
  const strengths = sanitizeStringArray([
    bulletLines.length >= 6
      ? "Resume uses bullet points which improves ATS readability."
      : null,
    numericMatches.length >= 3
      ? "Includes quantified results, which improves impact."
      : null,
    actionVerbMatches.length >= 5
      ? "Demonstrates strong action-oriented achievement language."
      : null,
    headingChecks.experience
      ? "Work experience section is clearly identifiable."
      : null,
    headingChecks.skills
      ? "Skills section exists for quick recruiter scanning."
      : null,
  ]);

  const risks = sanitizeStringArray([
    !headingChecks.summary
      ? "Missing a clear professional summary section."
      : null,
    !headingChecks.education ? "Education section is missing or unclear." : null,
    numericMatches.length < 2
      ? "Few measurable outcomes detected in bullet points."
      : null,
    bulletLines.length < 4
      ? "Resume has limited bullet formatting, which may reduce ATS clarity."
      : null,
    currentSkills.length < 4
      ? "Limited alignment with market-relevant skills was detected."
      : null,
  ]);

  const keywordGaps = missingCriticalSkills.slice(0, 6);
  const atsTips = sanitizeStringArray([
    !headingChecks.summary ? "Add a 2-3 line professional summary at the top." : null,
    numericMatches.length < 3
      ? "Add metrics to outcomes (for example %, $, time saved, volume)."
      : null,
    bulletLines.length < 6
      ? "Use concise bullet points under each role with one achievement per line."
      : null,
    currentSkills.length < benchmarkSkills.length / 2
      ? "Align wording with target-role keywords from job descriptions."
      : null,
    "Keep section titles standard: Summary, Skills, Experience, Education, Projects.",
  ]);

  const recommendedRoles = sanitizeStringArray(
    (user.industryInsight?.salaryRanges || [])
      .map((item) => String(item?.role || "").trim())
      .filter(Boolean)
      .slice(0, 5)
  );

  // Deterministic learning plan generated from missing benchmark skills.
  const learningPriorities = missingCriticalSkills.slice(0, 5).map((skill) => ({
    skill,
    reason: `This skill appears in market demand signals for ${
      user.industry || "your target roles"
    } and is not strongly represented in your resume.`,
    effort: pickEffortBySkillName(skill),
  }));

  const nextSteps = sanitizeStringArray([
    "Rewrite 3 experience bullets with clear before-after impact metrics.",
    "Add top missing keywords naturally into summary, skills, and experience sections.",
    "Match at least one resume version to a specific role and JD before applying.",
    "Build one project or certification item around the top missing skill.",
  ]);

  const deterministicAnalysis = normalizeResumeInsights({
    algorithm: ANALYSIS_SOURCE.RULE_BASED,
    generatedAt: new Date().toISOString(),
    resumeAnalysis: {
      score: overallScore,
      overallVerdict: scoreToVerdict(overallScore),
      summary:
        "This report is generated by a deterministic in-house rules engine using structure, readability, metrics usage, and market keyword coverage.",
      strengths,
      risks,
      keywordGaps,
      atsTips,
      recommendedRoles,
      sectionScores: {
        atsReadability,
        impact,
        keywordAlignment,
        structure,
      },
    },
    skillGapAnalysis: {
      alignmentScore: keywordAlignment,
      currentSkills,
      missingCriticalSkills,
      adjacentSkills,
      learningPriorities,
      nextSteps,
    },
  });

  return await saveAnalysisPayload({
    user,
    normalizedAnalysis: deterministicAnalysis,
  });
}

export async function getLatestResumeAnalysis() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      resume: true,
    },
  });

  if (!user?.resume) return null;

  const envelope = parseFeedbackEnvelope(user.resume.feedback);

  if (!envelope.latest) return null;

  return {
    latest: envelope.latest,
    history: envelope.history,
    hasResume: Boolean(user.resume.content?.trim()),
    lastAnalyzedAt: envelope.latest.generatedAt,
  };
}
