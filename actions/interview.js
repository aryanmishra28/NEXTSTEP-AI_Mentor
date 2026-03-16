"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const INTERVIEW_MODE = {
  STANDARD: "standard",
  WEAK_AREAS: "weak-areas",
};

const HOT_TOPIC_MAP = {
  "gen-ai": "Generative AI and LLM systems",
  nextjs: "Next.js",
  react: "React",
  javascript: "JavaScript",
  os: "Operating Systems",
  dbms: "DBMS and SQL databases",
};

const buildStandardPrompt = (user) => `
    Generate 10 technical interview questions for a ${user.industry
    } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.

    Each question should be multiple choice with 4 options.

    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

const buildWeakAreasPrompt = ({ user, weakAreas }) => `
    Generate 10 technical interview questions for a ${user.industry || "general technology"
  } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.

    The quiz must focus on these weak areas discovered from previous mistakes:
    ${weakAreas}

    Requirements:
    - Target concepts the user previously missed.
    - Keep the questions practical and role-relevant.
    - Include a spread from foundational to intermediate difficulty.
    - Each question must be multiple choice with exactly 4 options.

    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

export async function generateQuiz(options = {}) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  let prompt = buildStandardPrompt(user);
  let mode = INTERVIEW_MODE.STANDARD;

  if (options?.mode === INTERVIEW_MODE.WEAK_AREAS) {
    const previousAssessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const weakQuestionSummaries = previousAssessments
      .flatMap((assessment) => assessment.questions || [])
      .filter((item) => !item.isCorrect)
      .slice(0, 12)
      .map(
        (item) =>
          `Question: ${item.question}\nCorrect answer: ${item.answer}\nExplanation: ${item.explanation}`
      );

    if (weakQuestionSummaries.length > 0) {
      mode = INTERVIEW_MODE.WEAK_AREAS;
      prompt = buildWeakAreasPrompt({
        user,
        weakAreas: weakQuestionSummaries.join("\n\n"),
      });
    }
  }

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return {
      mode,
      title:
        mode === INTERVIEW_MODE.WEAK_AREAS
          ? "Weak Areas Practice"
          : "Technical Quiz",
      questions: quiz.questions,
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score, metadata = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category:
          metadata?.mode === INTERVIEW_MODE.WEAK_AREAS
            ? "Technical - Weak Areas"
            : "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}

export async function generateHotTopicQA({
  topic,
  difficulty = "medium",
  count = 6,
} = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const normalizedTopic = String(topic || "").trim();
  if (!normalizedTopic || !HOT_TOPIC_MAP[normalizedTopic]) {
    throw new Error("Invalid topic selected");
  }

  const normalizedDifficulty = ["easy", "medium", "hard"].includes(
    String(difficulty).toLowerCase()
  )
    ? String(difficulty).toLowerCase()
    : "medium";

  const questionCount = Math.max(3, Math.min(12, Number(count) || 6));

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    Generate ${questionCount} interview study Q&A pairs for topic: ${
    HOT_TOPIC_MAP[normalizedTopic]
  }.
    Difficulty: ${normalizedDifficulty}.
    Candidate context: industry=${user?.industry || "general"}, skills=${
    user?.skills?.join(", ") || "not specified"
  }.

    Requirements:
    - Provide practical interview-focused questions.
    - Provide concise but clear answers (3-6 lines each).
    - Keep answers technically accurate and suitable for revision.
    - Return ONLY JSON in the exact format below.

    {
      "qa": [
        {
          "question": "string",
          "answer": "string"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    const qa = (parsed?.qa || [])
      .map((item) => ({
        question: String(item?.question || "").trim(),
        answer: String(item?.answer || "").trim(),
      }))
      .filter((item) => item.question && item.answer)
      .slice(0, questionCount);

    if (!qa.length) {
      throw new Error("No valid Q&A returned");
    }

    return {
      topic: normalizedTopic,
      difficulty: normalizedDifficulty,
      count: qa.length,
      qa,
    };
  } catch (error) {
    console.error("Error generating hot topic Q&A:", error);
    throw new Error("Failed to generate random Q&A");
  }
}
