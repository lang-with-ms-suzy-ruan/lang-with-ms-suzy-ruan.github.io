import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";

type Phase = "units" | "tasks" | "setup" | "quiz" | "summary";
type QuestionType = "multiple_choice" | "true_false" | "fill_blank";
type AnswerState = "idle" | "correct" | "wrong";

interface Question {
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: { en: string; vi: string };
}

interface Task {
  task: string;
  questions: Question[];
}

interface UnitData {
  unit: string;
  tasks: Task[];
}

interface Unit extends UnitData {
  _key: string;
}

const unitModules = import.meta.glob("../data/practice_quiz/*.json", { eager: true }) as Record<string, any>;

const ALL_UNITS: Unit[] = Object.entries(unitModules)
  .map(([key, mod]) => ({ ...((mod.default ?? mod) as UnitData), _key: key }))
  .sort((a, b) => a.unit.localeCompare(b.unit));

const COUNTS = [5, 10, 20];

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const NEO_BTN = "border-4 border-ink font-black transition-all shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none";

export const PracticeQuizApp = ({ onBack, lang }: { onBack: () => void; lang: "en" | "vi" }) => {
  const [phase, setPhase] = useState<Phase>("units");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [fillInput, setFillInput] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIdx];

  function startQuiz(task: Task, count: number) {
    setQuestions(shuffled(task.questions).slice(0, count));
    setCurrentIdx(0);
    setScore(0);
    setAnswerState("idle");
    setFillInput("");
    setPhase("quiz");
  }

  function handleAnswer(isCorrect: boolean) {
    if (answerState !== "idle") return;
    setAnswerState(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore(s => s + 1);
  }

  function next() {
    if (currentIdx + 1 >= questions.length) {
      setPhase("summary");
    } else {
      setCurrentIdx(i => i + 1);
      setAnswerState("idle");
      setFillInput("");
    }
  }

  // ─── Units ────────────────────────────────────────────────────────────────

  if (phase === "units") {
    return (
      <div className="min-h-screen bg-brand-secondary p-6">
        <button onClick={onBack} className="flex items-center gap-1 font-black text-ink mb-8 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-4xl font-black text-ink mb-8 tracking-tight">Practice Quiz</h1>
        {ALL_UNITS.length === 0 ? (
          <p className="text-ink/50 font-bold">No units found. Add JSON files to <code>src/data/practice_quiz/</code>.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {ALL_UNITS.map((unit, i) => (
              <Card
                key={i}
                className={`p-6 bg-white cursor-pointer ${NEO_BTN}`}
                onClick={() => { setSelectedUnit(unit); setPhase("tasks"); }}
              >
                <div className="text-3xl mb-3">📚</div>
                <h2 className="font-black text-ink text-lg leading-tight">{unit.unit}</h2>
                <p className="text-ink/40 text-xs font-black mt-2 uppercase tracking-widest">
                  {unit.tasks.length} task{unit.tasks.length !== 1 ? "s" : ""}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Tasks ────────────────────────────────────────────────────────────────

  if (phase === "tasks" && selectedUnit) {
    return (
      <div className="min-h-screen bg-brand-secondary p-6">
        <button onClick={() => setPhase("units")} className="flex items-center gap-1 font-black text-ink mb-6 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-5 h-5" /> Units
        </button>
        <h1 className="text-3xl font-black text-ink mb-1 tracking-tight">{selectedUnit.unit}</h1>
        <p className="text-xs font-black text-ink/40 uppercase tracking-widest mb-8">Choose a task</p>
        <div className="flex flex-col gap-3 max-w-xl">
          {selectedUnit.tasks.map((task, i) => (
            <Card
              key={i}
              className={`p-5 bg-white cursor-pointer ${NEO_BTN}`}
              onClick={() => {
                setSelectedTask(task);
                setQuestionCount(Math.min(10, task.questions.length));
                setPhase("setup");
              }}
            >
              <div className="flex justify-between items-center">
                <h2 className="font-black text-ink">{task.task}</h2>
                <span className="text-xs font-black text-ink/30 shrink-0 ml-4 uppercase tracking-widest">
                  {task.questions.length} Q
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Setup ────────────────────────────────────────────────────────────────

  if (phase === "setup" && selectedTask) {
    const maxCount = selectedTask.questions.length;
    const countOptions = [...new Set([...COUNTS.filter(c => c < maxCount), maxCount])];

    return (
      <div className="min-h-screen bg-brand-secondary flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button onClick={() => setPhase("tasks")} className="flex items-center gap-1 font-black text-ink mb-8 hover:opacity-70 transition-opacity">
            <ChevronLeft className="w-5 h-5" /> Tasks
          </button>
          <Card className="p-8 border-4 border-ink shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] bg-white">
            <h2 className="text-xl font-black text-ink mb-1 leading-tight">{selectedTask.task}</h2>
            <p className="text-xs font-black text-ink/40 uppercase tracking-widest mb-8">How many questions?</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {countOptions.map(c => {
                const label = c === maxCount && !COUNTS.includes(c) ? `All (${c})` : String(c);
                const selected = questionCount === c;
                return (
                  <button
                    key={c}
                    onClick={() => setQuestionCount(c)}
                    className={`h-14 rounded-2xl border-4 border-ink font-black text-lg transition-all ${
                      selected
                        ? "bg-brand-primary translate-x-0.5 translate-y-0.5 shadow-none"
                        : "bg-white shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              className={`w-full h-14 bg-brand-primary text-ink rounded-2xl text-lg ${NEO_BTN}`}
              onClick={() => startQuiz(selectedTask, questionCount)}
            >
              Start Quiz →
            </button>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Quiz ─────────────────────────────────────────────────────────────────

  if (phase === "quiz" && currentQuestion) {
    const isAnswered = answerState !== "idle";
    const progress = (currentIdx / questions.length) * 100;

    return (
      <div className="min-h-screen bg-brand-secondary flex flex-col">
        {/* Progress bar */}
        <div className="flex items-center gap-4 px-4 py-3 bg-white border-b-4 border-ink">
          <button
            onClick={() => setPhase("tasks")}
            className="text-ink hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 h-3 bg-ink/10 rounded-full border-2 border-ink overflow-hidden">
            <motion.div
              className="h-full bg-brand-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="font-black text-ink text-sm shrink-0">
            {currentIdx + 1} / {questions.length}
          </span>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl"
            >
              <Card className="p-6 border-4 border-ink shadow-[6px_6px_0px_0px_rgba(45,52,54,1)] bg-white mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-ink/30 mb-3">
                  {currentQuestion.type === "multiple_choice"
                    ? "Multiple Choice"
                    : currentQuestion.type === "true_false"
                    ? "True / False"
                    : "Fill in the Blank"}
                </p>
                <p className="text-ink font-black text-xl leading-snug">{currentQuestion.question}</p>
              </Card>

              {/* Multiple choice options */}
              {currentQuestion.type === "multiple_choice" && (
                <div className="flex flex-col gap-3">
                  {currentQuestion.options?.map((opt, i) => {
                    const isCorrect = opt === currentQuestion.answer;
                    let cls = "w-full p-4 rounded-2xl border-4 border-ink font-bold text-left transition-all";
                    if (!isAnswered) {
                      cls += " bg-white shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none";
                    } else if (isCorrect) {
                      cls += " bg-green-200 shadow-none";
                    } else {
                      cls += " bg-white opacity-40 shadow-none";
                    }
                    return (
                      <button key={i} className={cls} disabled={isAnswered}
                        onClick={() => handleAnswer(opt === currentQuestion.answer)}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True / False */}
              {currentQuestion.type === "true_false" && (
                <div className="grid grid-cols-2 gap-4">
                  {(["true", "false"] as const).map(val => {
                    const isCorrect = val === currentQuestion.answer.toLowerCase();
                    let cls = "h-16 rounded-2xl border-4 border-ink font-black text-lg transition-all";
                    if (!isAnswered) {
                      cls += " bg-white shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none";
                    } else if (isCorrect) {
                      cls += " bg-green-200 shadow-none";
                    } else {
                      cls += " bg-white opacity-40 shadow-none";
                    }
                    return (
                      <button key={val} className={cls} disabled={isAnswered}
                        onClick={() => handleAnswer(val === currentQuestion.answer.toLowerCase())}>
                        {val === "true" ? "✓  True" : "✗  False"}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the blank */}
              {currentQuestion.type === "fill_blank" && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={fillInput}
                    onChange={e => setFillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !isAnswered)
                        handleAnswer(fillInput.trim().toLowerCase() === currentQuestion.answer.toLowerCase());
                    }}
                    disabled={isAnswered}
                    placeholder="Type your answer…"
                    autoFocus
                    className={`flex-1 h-14 px-4 rounded-2xl border-4 border-ink font-bold text-ink outline-none transition-all ${
                      isAnswered
                        ? answerState === "correct" ? "bg-green-200" : "bg-red-100"
                        : "bg-white shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none"
                    }`}
                  />
                  {!isAnswered && (
                    <button
                      onClick={() => handleAnswer(fillInput.trim().toLowerCase() === currentQuestion.answer.toLowerCase())}
                      className={`h-14 px-6 rounded-2xl bg-brand-primary ${NEO_BTN}`}
                    >
                      Check
                    </button>
                  )}
                </div>
              )}

              {/* Feedback + Explanation */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-5 rounded-2xl border-4 border-ink ${
                      answerState === "correct" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {answerState === "correct"
                        ? <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                        : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                      <span className="font-black text-ink">
                        {answerState === "correct"
                          ? "Correct!"
                          : `Incorrect — Answer: ${currentQuestion.answer}`}
                      </span>
                    </div>
                    <p className="text-ink/70 font-bold text-sm leading-relaxed pl-7">
                      {currentQuestion.explanation[lang]}
                    </p>
                    <button
                      onClick={next}
                      className={`mt-4 w-full h-12 rounded-xl bg-brand-primary ${NEO_BTN}`}
                    >
                      {currentIdx + 1 >= questions.length ? "See Results →" : "Next →"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  if (phase === "summary") {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚";
    return (
      <div className="min-h-screen bg-brand-secondary flex items-center justify-center p-6">
        <Card className="p-8 border-4 border-ink shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] bg-white max-w-sm w-full text-center">
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-5xl font-black text-ink mb-2">{pct}%</h2>
          <p className="text-xs font-black text-ink/40 uppercase tracking-widest mb-8">
            {score} / {questions.length} correct
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => startQuiz(selectedTask!, questionCount)}
              className={`w-full h-12 rounded-xl bg-brand-primary flex items-center justify-center gap-2 ${NEO_BTN}`}
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => setPhase("tasks")}
              className={`w-full h-12 rounded-xl bg-white ${NEO_BTN}`}
            >
              Other Tasks
            </button>
            <button
              onClick={() => setPhase("units")}
              className={`w-full h-12 rounded-xl bg-white ${NEO_BTN}`}
            >
              All Units
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};
