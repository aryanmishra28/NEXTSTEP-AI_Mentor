"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { generateHotTopicQA } from "@/actions/interview";

const HOT_TOPICS = [
  {
    id: "gen-ai",
    label: "Gen AI",
    overview:
      "Understand LLM basics, prompting strategy, and safety/latency trade-offs in production apps.",
    keyConcepts: [
      "Transformers, embeddings, tokenization",
      "Prompt engineering, few-shot prompting, chain-of-thought risks",
      "RAG pipeline: ingestion, chunking, vector search, reranking",
      "Guardrails: hallucination control, moderation, output validation",
    ],
    interviewQA: [
      {
        question: "When should you choose RAG over fine-tuning?",
        answer:
          "Use RAG when knowledge changes frequently, you need source-grounded answers, and retraining cost must stay low. Use fine-tuning when behavior/style consistently needs change and your domain data is stable.",
      },
      {
        question: "How do you reduce hallucinations in a production chatbot?",
        answer:
          "Use retrieval grounding with high-quality chunks, add strict answer formatting, force citations, and add confidence thresholds that trigger fallback responses when context is weak.",
      },
      {
        question: "What metrics would you track for Gen AI quality and latency?",
        answer:
          "Track answer relevance, factuality, groundedness, refusal correctness, token usage, p95 latency, timeout rate, and user feedback signals like thumbs-up/down.",
      },
      {
        question: "What is the role of embeddings in Gen AI systems?",
        answer:
          "Embeddings convert text into vectors so semantically similar content can be retrieved. They power vector search in RAG and improve retrieval precision for prompts.",
      },
      {
        question: "How do you design chunking for RAG?",
        answer:
          "Chunk by semantic boundaries (headings/paragraphs), keep overlap for continuity, preserve metadata for filtering, and evaluate with retrieval precision before production rollout.",
      },
      {
        question: "How do you make Gen AI systems safer?",
        answer:
          "Apply input/output moderation, PII redaction, prompt injection defenses, policy-based guardrails, and human-review escalation for sensitive categories.",
      },
    ],
  },
  {
    id: "nextjs",
    label: "Next.js",
    overview:
      "Focus on App Router fundamentals, rendering strategies, and data-fetching patterns used in modern Next.js apps.",
    keyConcepts: [
      "Server vs Client components and boundary decisions",
      "Static, dynamic, and streaming rendering",
      "Route handlers, middleware, and server actions",
      "Caching, revalidation, and performance optimization",
    ],
    interviewQA: [
      {
        question: "When would you use a Server Component over a Client Component?",
        answer:
          "Use Server Components for data fetching, secure backend access, and reduced client bundle size. Use Client Components when you need hooks, browser APIs, or interactive state.",
      },
      {
        question: "How does revalidation work in the App Router?",
        answer:
          "You can use time-based revalidation via fetch revalidate options or on-demand revalidation with revalidatePath/revalidateTag after mutations.",
      },
      {
        question: "How would you secure API routes and middleware in Next.js?",
        answer:
          "Enforce authentication at middleware and route handler boundaries, validate payloads server-side, and never trust client-only checks for authorization.",
      },
      {
        question: "When do you choose static vs dynamic rendering?",
        answer:
          "Use static rendering for mostly stable content and speed. Use dynamic rendering when data is user-specific, permission-based, or rapidly changing per request.",
      },
      {
        question: "What is streaming in Next.js and why use it?",
        answer:
          "Streaming sends UI in chunks as data resolves. It improves perceived performance by showing ready sections early instead of blocking entire page rendering.",
      },
      {
        question: "What causes large client bundles in Next.js?",
        answer:
          "Overusing Client Components, importing heavy libraries into client code, and missing code splitting are common causes. Keep logic server-side when possible.",
      },
    ],
  },
  {
    id: "react",
    label: "React",
    overview:
      "Master state management, rendering behavior, and performance optimization techniques.",
    keyConcepts: [
      "Hooks lifecycle: useEffect/useMemo/useCallback trade-offs",
      "Controlled vs uncontrolled components",
      "Context, lifting state, and component composition",
      "Memoization and avoiding unnecessary re-renders",
    ],
    interviewQA: [
      {
        question: "How do you debug unnecessary re-renders?",
        answer:
          "Use React DevTools profiler, inspect prop identity changes, memoize expensive children selectively, and avoid recreating callbacks/objects unless needed.",
      },
      {
        question: "When does useMemo help and when can it hurt?",
        answer:
          "It helps for expensive computations with stable dependencies. It hurts when added everywhere because memoization itself has overhead and increases complexity.",
      },
      {
        question: "How do you structure reusable stateful logic across components?",
        answer:
          "Extract custom hooks for domain logic, keep UI components presentational, and colocate state near where it is used while lifting only when truly shared.",
      },
      {
        question: "How do you avoid prop drilling in large apps?",
        answer:
          "Use composition first, then Context for cross-cutting state, and dedicated state libraries only when Context becomes noisy or performance-sensitive.",
      },
      {
        question: "What is the difference between controlled and uncontrolled components?",
        answer:
          "Controlled components keep form state in React state; uncontrolled components rely on DOM state and refs. Controlled is better for validation and dynamic UI.",
      },
      {
        question: "How do effects differ from event handlers?",
        answer:
          "Event handlers run from user actions, while effects synchronize with external systems after render. Effects should not be used for pure calculations.",
      },
    ],
  },
  {
    id: "javascript",
    label: "JavaScript",
    overview:
      "Revise language fundamentals that are frequently tested in frontend and full-stack interviews.",
    keyConcepts: [
      "Closures, lexical scope, and hoisting",
      "Event loop, microtasks vs macrotasks",
      "Prototypes, this binding, and object model",
      "Async/await, promises, and error propagation",
    ],
    interviewQA: [
      {
        question: "Explain the event loop with a real async code example.",
        answer:
          "Synchronous code runs first, then microtasks (Promise callbacks), then macrotasks (setTimeout). This order explains why resolved Promise logs often appear before timeout logs.",
      },
      {
        question: "How does closure help in practical frontend code?",
        answer:
          "Closures let functions retain lexical state, useful for factories, private variables, memoized helpers, and event handlers bound to specific context.",
      },
      {
        question: "Difference between call, apply, and bind?",
        answer:
          "call/apply invoke immediately with explicit this (apply accepts array args). bind returns a new function with this and optional args preconfigured.",
      },
      {
        question: "What are common pitfalls with == and ===?",
        answer:
          "== coerces types and can produce surprising truthy comparisons. === checks both type and value and should be default for predictable behavior.",
      },
      {
        question: "How does prototype inheritance work?",
        answer:
          "Objects delegate property lookup to their prototype chain. Methods placed on prototypes are shared across instances and are memory-efficient.",
      },
      {
        question: "How should async errors be handled in JavaScript?",
        answer:
          "Use try/catch with await, return meaningful errors, avoid swallowing exceptions, and centralize fallback handling for network and parsing failures.",
      },
    ],
  },
  {
    id: "os",
    label: "OS",
    overview:
      "Build confidence in process/thread fundamentals and system-level scheduling/memory concepts.",
    keyConcepts: [
      "Process vs thread and context switching",
      "CPU scheduling: FCFS, SJF, Round Robin",
      "Deadlock conditions and prevention techniques",
      "Virtual memory, paging, and page replacement",
    ],
    interviewQA: [
      {
        question: "How do processes differ from threads in memory sharing?",
        answer:
          "Processes have isolated address spaces, while threads share process memory. Threads are lighter but require synchronization to avoid race conditions.",
      },
      {
        question: "What causes deadlock and how can systems avoid it?",
        answer:
          "Deadlock requires mutual exclusion, hold-and-wait, no preemption, and circular wait. Prevent by breaking one condition (ordering resources, timeouts, preemption).",
      },
      {
        question: "When is Round Robin preferred over SJF?",
        answer:
          "Round Robin is better for time-sharing systems needing responsiveness and fairness. SJF may reduce average waiting time but can starve long jobs.",
      },
      {
        question: "What is virtual memory and why is it important?",
        answer:
          "Virtual memory abstracts physical RAM, allowing larger address spaces and process isolation. It enables paging and controlled swapping under memory pressure.",
      },
      {
        question: "What happens during a context switch?",
        answer:
          "CPU saves the current process/thread state and loads another one. Frequent context switching increases overhead and can reduce throughput.",
      },
      {
        question: "How do paging and segmentation differ?",
        answer:
          "Paging uses fixed-size blocks and avoids external fragmentation; segmentation uses variable-size logical segments but can suffer external fragmentation.",
      },
    ],
  },
  {
    id: "dbms",
    label: "DBMS",
    overview:
      "Review normalization, indexing, and transaction behavior to answer backend-heavy interview rounds.",
    keyConcepts: [
      "Normalization (1NF/2NF/3NF/BCNF)",
      "Index types and query execution plans",
      "ACID properties and isolation levels",
      "Joins, constraints, and schema design trade-offs",
    ],
    interviewQA: [
      {
        question: "How do isolation levels impact concurrency behavior?",
        answer:
          "Higher isolation reduces anomalies but lowers concurrency. Read Committed is common default; Serializable is safest but can be slow and contention-heavy.",
      },
      {
        question: "When should you denormalize a schema?",
        answer:
          "Denormalize for read-heavy workloads where joins are expensive and access patterns are stable, while balancing consistency and update complexity.",
      },
      {
        question: "How would you diagnose a slow SQL query?",
        answer:
          "Use EXPLAIN plans, check index usage, filter selectivity, join cardinality, and scan types; then optimize query shape and indexing strategy.",
      },
      {
        question: "What are ACID properties in transactions?",
        answer:
          "Atomicity, Consistency, Isolation, Durability ensure reliable state changes even under concurrent access and failures.",
      },
      {
        question: "What is the difference between clustered and non-clustered index?",
        answer:
          "Clustered index defines physical row order (usually one per table). Non-clustered indexes are separate lookup structures pointing to rows.",
      },
      {
        question: "How do you choose columns for a composite index?",
        answer:
          "Place most selective and frequently filtered columns first, aligned to common query predicates and ordering patterns.",
      },
    ],
  },
];

export default function HotTopicsSection() {
  const [activeTopic, setActiveTopic] = useState(HOT_TOPICS[0].id);
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState("6");

  const {
    data: generatedQA,
    loading: generatingQA,
    fn: generateHotTopicQAFn,
  } = useFetch(generateHotTopicQA);

  const handleGenerateRandomQA = async () => {
    await generateHotTopicQAFn({
      topic: activeTopic,
      difficulty,
      count: Number(count),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">
          Study Hot Topics
        </CardTitle>
        <CardDescription>
          Quick revision notes before your next mock interview.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={HOT_TOPICS[0].id}
          className="space-y-4"
          onValueChange={setActiveTopic}
        >
          <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
            {HOT_TOPICS.map((topic) => (
              <TabsTrigger key={topic.id} value={topic.id}>
                {topic.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {HOT_TOPICS.map((topic) => (
            <TabsContent key={topic.id} value={topic.id} className="mt-2">
              <div className="rounded-xl border p-4 md:p-6 space-y-4">
                <p className="text-sm text-muted-foreground">{topic.overview}</p>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Key Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {topic.keyConcepts.map((concept) => (
                      <Badge key={concept} variant="secondary">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Common Interview Questions with Answers
                  </h3>

                  <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={count} onValueChange={setCount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Question count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 Questions</SelectItem>
                        <SelectItem value="6">6 Questions</SelectItem>
                        <SelectItem value="8">8 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      onClick={handleGenerateRandomQA}
                      disabled={generatingQA}
                    >
                      {generatingQA ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Random Q&A
                        </>
                      )}
                    </Button>
                  </div>

                  {generatedQA?.topic === topic.id ? (
                    <Accordion type="single" collapsible className="w-full mb-4">
                      {generatedQA.qa.map((qa, index) => (
                        <AccordionItem
                          key={`${qa.question}-${index}`}
                          value={`${topic.id}-dynamic-${index}`}
                        >
                          <AccordionTrigger className="text-left">
                            {index + 1}. {qa.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground">
                              {qa.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : null}

                  <Accordion type="single" collapsible className="w-full">
                    {topic.interviewQA.map((qa, index) => (
                      <AccordionItem key={qa.question} value={`${topic.id}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {index + 1}. {qa.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">{qa.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
