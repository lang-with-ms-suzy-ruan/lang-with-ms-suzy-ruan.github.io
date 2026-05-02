import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, RefreshCw, Trophy, ImageIcon, Globe, BookOpen, Volume2 } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type QuizMode = "picture" | "word-vi" | "vi-word";
type Phase = "setup" | "quiz" | "result";
type AnswerState = "idle" | "correct" | "wrong";

interface Word {
  no: number;
  word: string;
  partsOfSpeech: string;
  ipa: string;
  vietnamese: string;
  example: string;
  image: string;
}

interface Question {
  correct: Word;
  options: Word[];
}

interface Preset { label: string; from: number; to: number }

const PRESETS: Preset[] = [
  { label: "All",     from: 1,   to: 9999 },
  { label: "1–100",   from: 1,   to: 100  },
  { label: "101–200", from: 101, to: 200  },
  { label: "201–300", from: 201, to: 300  },
  { label: "301–400", from: 301, to: 400  },
  { label: "401–500", from: 401, to: 500  },
  { label: "501+",    from: 501, to: 9999 },
];

function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(rangedWords: Word[], pool: Word[], count: number): Question[] {
  return shuffled(rangedWords).slice(0, count).map(correct => {
    const wrong = shuffled(pool.filter(w => w.word !== correct.word)).slice(0, 3);
    return { correct, options: shuffled([correct, ...wrong]) };
  });
}

function getExampleParts(example: string) {
  const lines = example.split("\n").map(l => l.trim());
  const eng = lines.find(l => !l.startsWith("(")) || "";
  const vi  = lines.find(l => l.startsWith("("))?.replace(/[()]/g, "") || "";
  return { eng, vi };
}

function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    (v.name.includes("David") || v.name.includes("Mark") || v.name.includes("Guy")) && v.lang.includes("en-US")
  ) || voices.find(v => v.lang.includes("en-US"));
  if (preferred) utterance.voice = preferred;
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

const MODES: { id: QuizMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "picture", label: "Picture Quiz",       desc: "See the card → pick Vietnamese meaning", icon: <ImageIcon className="w-5 h-5" /> },
  { id: "word-vi", label: "Word → Vietnamese",  desc: "See English → pick Vietnamese",          icon: <Globe className="w-5 h-5" /> },
  { id: "vi-word", label: "Vietnamese → Word",  desc: "See Vietnamese → pick English",          icon: <BookOpen className="w-5 h-5" /> },
];

const COUNTS = [10, 20, 30];

function scoreEmoji(score: number, total: number) {
  const pct = score / total;
  if (pct === 1)  return { emoji: "🏆", msg: "Perfect!" };
  if (pct >= 0.8) return { emoji: "🌟", msg: "Excellent!" };
  if (pct >= 0.6) return { emoji: "👍", msg: "Good job!" };
  if (pct >= 0.4) return { emoji: "💪", msg: "Keep practising!" };
  return            { emoji: "📚", msg: "Study more!" };
}

interface Props { onBack: () => void }

export function MoversQuizApp({ onBack }: Props) {
  const [allWords, setAllWords]         = useState<Word[]>([]);
  const [phase, setPhase]               = useState<Phase>("setup");
  const [mode, setMode]                 = useState<QuizMode>("picture");
  const [count, setCount]               = useState(10);
  const [rangeFrom, setRangeFrom]       = useState(1);
  const [rangeTo, setRangeTo]           = useState(9999);
  const [questions, setQuestions]       = useState<Question[]>([]);
  const [index, setIndex]               = useState(0);
  const [score, setScore]               = useState(0);
  const [answerState, setAnswerState]   = useState<AnswerState>("idle");
  const [chosenIndex, setChosenIndex]   = useState<number | null>(null);

  useEffect(() => {
    fetch("/media/movers/words.csv")
      .then(r => r.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: ({ data }: { data: any[] }) => {
            setAllWords(
              data.map((row, idx) => {
                const word = (row["Word"] || "").trim();
                const sanitized = word.replace(/\n/g, " ").replace(/\s+/g, " ").replace(/\//g, "_");
                return {
                  no: parseInt(row["No"]) || idx + 1,
                  word,
                  partsOfSpeech: row["Parts of Speech"] || "",
                  ipa: row["IPA"] || "",
                  vietnamese: row["Vietnamese"] || "",
                  example: row["Example"] || "",
                  image: `/media/movers/imgs/${sanitized}.png`,
                };
              })
            );
          },
        });
      });
  }, []);

  const rangedWords   = allWords.filter(w => w.no >= rangeFrom && w.no <= rangeTo);
  const activePreset  = PRESETS.find(p => p.from === rangeFrom && p.to === rangeTo) ?? null;

  const startQuiz = useCallback(() => {
    const pool = rangedWords.length >= 4 ? rangedWords : allWords;
    setQuestions(buildQuestions(rangedWords, pool, Math.min(count, rangedWords.length)));
    setIndex(0);
    setScore(0);
    setAnswerState("idle");
    setChosenIndex(null);
    setPhase("quiz");
  }, [allWords, rangedWords, count]);

  const advanceQuestion = useCallback(() => {
    if (index + 1 >= questions.length) {
      setPhase("result");
    } else {
      setIndex(i => i + 1);
      setAnswerState("idle");
      setChosenIndex(null);
    }
  }, [index, questions.length]);

  const handleAnswer = (optionIndex: number) => {
    if (answerState !== "idle") return;
    const isCorrect = questions[index].options[optionIndex] === questions[index].correct;
    setChosenIndex(optionIndex);
    setAnswerState(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore(s => s + 1);

    // picture mode: user advances manually; other modes: auto-advance
    if (mode !== "picture") {
      setTimeout(advanceQuestion, 900);
    }
  };

  const getOptionLabel = (w: Word) => mode === "word-vi" ? w.vietnamese : w.word;
  const correctIndex = questions[index]
    ? questions[index].options.indexOf(questions[index].correct)
    : -1;

  /* ── Setup ── */
  if (phase === "setup") {
    const canStart = rangedWords.length >= 1;
    return (
      <div className="min-h-screen bg-brand-secondary/10 pt-10 pb-16 px-6">
        <div className="max-w-lg mx-auto">
          <Button variant="ghost" className="mb-8 font-black text-ink/60 hover:text-ink" onClick={onBack}>
            <ChevronLeft className="mr-2 w-4 h-4" /> Back
          </Button>

          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center border-4 border-ink shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
              <Trophy className="w-7 h-7 text-ink" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Movers Quiz</h1>
              <p className="text-ink/50 font-bold text-sm">{allWords.length} words loaded</p>
            </div>
          </div>

          {/* Mode */}
          <p className="font-black uppercase text-xs tracking-widest text-ink/40 mb-3">Quiz Mode</p>
          <div className="space-y-3 mb-8">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-4 font-bold text-left transition-all ${
                  mode === m.id
                    ? "border-ink bg-brand-primary shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]"
                    : "border-ink/20 bg-white hover:border-ink"
                }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                  mode === m.id ? "border-ink bg-white" : "border-ink/20 bg-ink/5"
                }`}>
                  {m.icon}
                </span>
                <span>
                  <span className="block font-black">{m.label}</span>
                  <span className="block text-xs text-ink/50 font-bold">{m.desc}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Word Range */}
          <p className="font-black uppercase text-xs tracking-widest text-ink/40 mb-3">Word Range</p>
          <div className="bg-white border-4 border-ink/10 rounded-2xl p-4 mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setRangeFrom(p.from); setRangeTo(p.to); }}
                  className={`h-9 px-4 rounded-xl border-2 font-black text-sm transition-all ${
                    activePreset?.label === p.label
                      ? "border-ink bg-brand-primary shadow-[3px_3px_0px_0px_rgba(45,52,54,1)]"
                      : "border-ink/20 hover:border-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-black text-ink/40 uppercase mb-1">From #</label>
                <input
                  type="number"
                  min={1}
                  max={allWords.length || 681}
                  value={rangeFrom}
                  onChange={e => setRangeFrom(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-11 border-2 border-ink/20 rounded-xl px-3 font-black text-center focus:border-ink outline-none transition-colors"
                />
              </div>
              <span className="font-black text-ink/30 mt-5">–</span>
              <div className="flex-1">
                <label className="block text-xs font-black text-ink/40 uppercase mb-1">To #</label>
                <input
                  type="number"
                  min={1}
                  max={allWords.length || 681}
                  value={rangeTo === 9999 ? (allWords.length || 681) : rangeTo}
                  onChange={e => setRangeTo(Math.max(rangeFrom, parseInt(e.target.value) || rangeFrom))}
                  className="w-full h-11 border-2 border-ink/20 rounded-xl px-3 font-black text-center focus:border-ink outline-none transition-colors"
                />
              </div>
            </div>
            <p className="text-xs font-bold text-ink/40 mt-3 text-center">
              {rangedWords.length} word{rangedWords.length !== 1 ? "s" : ""} in range
            </p>
          </div>

          {/* Questions */}
          <p className="font-black uppercase text-xs tracking-widest text-ink/40 mb-3">Questions</p>
          <div className="flex gap-3 mb-10">
            {COUNTS.map(c => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`flex-1 h-14 rounded-2xl border-4 font-black text-xl transition-all ${
                  count === c
                    ? "border-ink bg-brand-primary shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]"
                    : "border-ink/20 bg-white hover:border-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <Button
            onClick={startQuiz}
            disabled={!canStart}
            className="w-full h-16 bg-ink text-white rounded-2xl font-black text-xl hover:bg-brand-primary hover:text-ink border-4 border-ink transition-all shadow-[6px_6px_0px_0px_rgba(45,52,54,1)] disabled:opacity-40"
          >
            Start Quiz
          </Button>
          {!canStart && (
            <p className="text-center text-red-500 font-bold text-sm mt-3">No words in selected range.</p>
          )}
        </div>
      </div>
    );
  }

  /* ── Result ── */
  if (phase === "result") {
    const { emoji, msg } = scoreEmoji(score, questions.length);
    return (
      <div className="min-h-screen bg-brand-secondary/10 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white rounded-[40px] border-4 border-ink shadow-[12px_12px_0px_0px_rgba(45,52,54,1)] p-10 text-center"
        >
          <div className="text-7xl mb-4">{emoji}</div>
          <h2 className="text-4xl font-black tracking-tight mb-1">{msg}</h2>
          <p className="text-ink/50 font-bold mb-8">Quiz complete</p>
          <div className="bg-brand-primary rounded-3xl border-4 border-ink p-6 mb-8 shadow-[6px_6px_0px_0px_rgba(45,52,54,1)]">
            <span className="text-6xl font-black">{score}</span>
            <span className="text-2xl font-black text-ink/40"> / {questions.length}</span>
            <p className="text-sm font-black text-ink/60 mt-1 uppercase tracking-wider">correct</p>
          </div>
          <div className="space-y-3">
            <Button onClick={startQuiz} className="w-full h-14 bg-ink text-white rounded-2xl font-black text-lg hover:bg-brand-primary hover:text-ink border-4 border-ink transition-all">
              <RefreshCw className="w-4 h-4 mr-2" /> Play Again
            </Button>
            <Button variant="outline" onClick={() => setPhase("setup")} className="w-full h-12 border-4 border-ink rounded-2xl font-black hover:bg-brand-accent transition-all">
              Change Settings
            </Button>
            <Button variant="ghost" onClick={onBack} className="w-full font-black text-ink/50 hover:text-ink">
              Back to Apps
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Quiz ── */
  const q        = questions[index];
  const progress = (index / questions.length) * 100;
  const answered = answerState !== "idle";

  /* Progress bar + score header — shared across modes */
  const QuizHeader = () => (
    <>
      <div className={`flex items-center justify-between px-6 pt-6 pb-3 ${mode === "picture" ? "" : "text-white"}`}>
        <Button
          variant="ghost"
          className={`font-black -ml-2 ${mode === "picture" ? "text-ink/50 hover:text-ink" : "text-white/50 hover:text-white hover:bg-white/10"}`}
          onClick={onBack}
        >
          <ChevronLeft className="mr-1 w-4 h-4" /> Exit
        </Button>
        <div className={`font-black ${mode === "picture" ? "" : "text-white"}`}>
          <span className="text-brand-primary text-xl">{score}</span>
          <span className={`text-sm ${mode === "picture" ? "text-ink/30" : "text-white/30"}`}> / {questions.length}</span>
        </div>
        <span className={`font-bold text-sm ${mode === "picture" ? "text-ink/40" : "text-white/40"}`}>{index + 1} / {questions.length}</span>
      </div>
      <div className={`h-2 mx-6 rounded-full overflow-hidden mb-4 ${mode === "picture" ? "bg-ink/10" : "bg-white/10"}`}>
        <motion.div
          className="h-full bg-brand-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </>
  );

  /* ── Picture mode: vocabulary card layout ── */
  if (mode === "picture") {
    const ex = getExampleParts(q.correct.example);
    return (
      <div className="min-h-screen bg-brand-secondary/5 flex flex-col">
        <QuizHeader />

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch"
            >
              {/* Image card */}
              <div className="lg:flex-1 h-64 lg:h-auto">
                <div className="h-full bg-white border-4 border-ink rounded-[32px] overflow-hidden flex items-center justify-center relative bg-brand-secondary/5 min-h-[240px]">
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-ink text-white font-black text-[10px]">NO. {q.correct.no}</Badge>
                  </div>
                  <img
                    src={q.correct.image}
                    alt=""
                    className="max-h-full max-w-full object-contain p-6 drop-shadow-xl"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              </div>

              {/* Info card */}
              <div className="lg:flex-[1.2] flex flex-col gap-4">
                <div className="bg-white border-4 border-ink rounded-[40px] p-6 lg:p-8 flex flex-col gap-4 shadow-sm">

                  {/* Word + IPA + POS */}
                  <div>
                    <button
                      className="text-4xl lg:text-5xl font-black tracking-tighter capitalize text-ink hover:text-brand-primary transition-colors text-left"
                      onClick={() => speak(q.correct.word)}
                    >
                      {q.correct.word}
                    </button>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <button
                        className="flex items-center gap-1 text-ink/40 italic text-base hover:text-brand-primary transition-colors"
                        onClick={() => speak(q.correct.word)}
                      >
                        {q.correct.ipa}
                        <Volume2 className="w-3 h-3" />
                      </button>
                      <div className="flex gap-1">
                        {q.correct.partsOfSpeech.split(",").map(pos => (
                          <Badge key={pos} variant="outline" className="text-[9px] font-black uppercase text-ink/40 border-ink/10 rounded-lg px-2 py-0 border-2">
                            {pos.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Vietnamese choices (before answer) / revealed meaning (after answer) */}
                  {!answered ? (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-40">Choose the Vietnamese meaning</p>
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <motion.button
                            key={i}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer(i)}
                            className="w-full text-left px-4 py-3 rounded-2xl border-4 border-ink/20 font-bold text-sm hover:border-ink hover:bg-brand-primary/20 transition-all"
                          >
                            {opt.vietnamese}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Revealed meaning */}
                      <div className={`p-4 rounded-2xl border-4 ${answerState === "correct" ? "bg-green-100 border-green-400" : "bg-red-50 border-red-300"}`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-40">Definition</p>
                        <p className="text-2xl font-black">{q.correct.vietnamese}</p>
                        {answerState === "wrong" && chosenIndex !== null && (
                          <p className="text-xs font-bold text-red-500 mt-2">
                            You chose: {q.options[chosenIndex].vietnamese}
                          </p>
                        )}
                      </div>

                      {/* Example sentence */}
                      {ex.eng && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Usage Example</p>
                          <p className="text-base font-bold leading-snug text-ink/70 bg-ink/5 p-4 rounded-2xl border-l-4 border-brand-primary italic">
                            "{ex.eng}"
                          </p>
                          {ex.vi && (
                            <p className="text-sm font-medium italic text-ink/40 bg-white border border-ink/10 p-3 rounded-xl">
                              {ex.vi}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Next button */}
                {answered && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Button
                      onClick={advanceQuestion}
                      className="w-full h-14 bg-ink text-white rounded-2xl font-black text-lg hover:bg-brand-primary hover:text-ink border-4 border-ink transition-all"
                    >
                      {index + 1 >= questions.length ? "See Results" : "Next"}
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  /* ── word-vi / vi-word modes: dark centered layout ── */
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <QuizHeader />

      <div className="flex-1 flex flex-col px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {/* Question card */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-[32px] p-8 text-center">
                {mode === "word-vi" ? (
                  <>
                    <p className="text-4xl font-black text-white mb-2">{q.correct.word}</p>
                    <p className="text-brand-primary font-bold">{q.correct.ipa}</p>
                  </>
                ) : (
                  <p className="text-3xl font-black text-white">{q.correct.vietnamese}</p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                let style = "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40";
                if (answered) {
                  if (i === correctIndex)    style = "bg-green-400 border-green-400 text-ink";
                  else if (i === chosenIndex) style = "bg-red-400 border-red-400 text-white";
                  else                       style = "bg-white/5 border-white/10 text-white/30";
                }
                return (
                  <motion.button
                    key={i}
                    whileTap={!answered ? { scale: 0.97 } : {}}
                    onClick={() => handleAnswer(i)}
                    className={`h-16 rounded-2xl border-2 font-black text-sm px-3 transition-all ${style}`}
                  >
                    {getOptionLabel(opt)}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
