import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Eye, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuizItem {
  kanjiChar: string;
  word: string;
  reading: string;
  meaning: string;
  meaningVi: string;
}

interface KanjiQuizAppProps {
  onBack: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const KanjiQuizApp: React.FC<KanjiQuizAppProps> = ({ onBack }) => {
  const [deck, setDeck] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/media/kanji/KanjiData.json')
      .then(r => r.json())
      .then((data: any[]) => {
        const items: QuizItem[] = [];
        for (const kanji of data) {
          for (const v of [...kanji.vocabulary, ...kanji.phrases]) {
            if (v.reading || v.meaning || v.meaningVi) {
              items.push({
                kanjiChar: kanji.char,
                word: v.word,
                reading: v.reading ?? '',
                meaning: v.meaning ?? '',
                meaningVi: v.meaningVi ?? '',
              });
            }
          }
        }
        setDeck(shuffle(items));
      })
      .catch(console.error);
  }, []);

  const handleNext = useCallback(() => {
    if (!revealed) { setRevealed(true); return; }
    setRevealed(false);
    setIdx(i => {
      if (i >= deck.length - 1) { setDone(true); return i; }
      return i + 1;
    });
  }, [revealed, deck.length]);

  const handlePrev = useCallback(() => {
    if (idx > 0) { setIdx(i => i - 1); setRevealed(false); }
  }, [idx]);

  const handleRestart = useCallback(() => {
    setDeck(d => shuffle(d));
    setIdx(0);
    setRevealed(false);
    setDone(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleNext(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev]);

  if (deck.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center gap-6 p-6">
        <div className="w-24 h-24 bg-brand-primary border-4 border-ink rounded-[28px] flex items-center justify-center text-5xl shadow-[6px_6px_0px_0px_rgba(45,52,54,1)]">
          🎉
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-tight">Deck Complete!</h2>
          <p className="text-ink/40 font-bold mt-1">{deck.length} cards reviewed</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="h-14 px-8 bg-brand-primary text-ink border-4 border-ink rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            onClick={handleRestart}
          >
            <Shuffle className="mr-2 w-4 h-4" /> Shuffle & Restart
          </Button>
          <Button
            variant="outline"
            className="h-14 px-8 border-4 border-ink rounded-2xl font-black hover:bg-brand-secondary/10"
            onClick={onBack}
          >
            Back to Apps
          </Button>
        </div>
      </div>
    );
  }

  const current = deck[idx];
  const displayMeaning = current.meaningVi || current.meaning;
  const progress = (idx / deck.length) * 100;

  return (
    <div className="h-screen bg-brand-secondary/5 text-ink flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b-2 border-ink/10 flex items-center justify-between px-4 shrink-0 z-10">
        <div>
          <h1 className="font-black text-lg tracking-tight leading-none uppercase">Kanji Quiz</h1>
          <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest leading-none mt-0.5">
            {idx + 1} / {deck.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl border-2 border-ink/10 hover:bg-brand-primary hover:border-ink transition-all"
            onClick={handleRestart}
            title="Shuffle & restart"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="font-black text-ink/40 hover:text-ink text-xs uppercase"
            onClick={onBack}
          >
            <X className="mr-1 w-4 h-4" /> Close
          </Button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-ink/5 shrink-0">
        <motion.div
          className="h-full bg-brand-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-6 min-h-0">
        {/* Card */}
        <div className="w-full max-w-lg" style={{ perspective: '1400px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{ height: '340px', position: 'relative' }}
            >
              <motion.div
                style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
                animate={{ rotateY: revealed ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Front */}
                <div
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  className="absolute inset-0 bg-white border-4 border-ink rounded-[40px] flex flex-col items-center justify-center p-8 cursor-pointer shadow-[6px_6px_0px_0px_rgba(45,52,54,0.12)] select-none"
                  onClick={() => setRevealed(true)}
                >
                  <div
                    className="font-black leading-none text-ink"
                    style={{ fontFamily: 'serif', fontSize: 'clamp(56px, 12vw, 96px)' }}
                  >
                    {current.word}
                  </div>
                  <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-ink/20">
                    tap · space · enter to reveal
                  </p>
                </div>

                {/* Back */}
                <div
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 bg-brand-primary border-4 border-ink rounded-[40px] flex flex-col items-center justify-center p-8 gap-2 shadow-[6px_6px_0px_0px_rgba(45,52,54,0.12)] select-none"
                >
                  {current.reading && (
                    <p className="text-base font-medium text-ink/60 tracking-wide">{current.reading}</p>
                  )}
                  <div
                    className="font-black leading-none text-ink"
                    style={{ fontFamily: 'serif', fontSize: 'clamp(44px, 10vw, 76px)' }}
                  >
                    {current.word}
                  </div>
                  {displayMeaning && (
                    <div className="mt-3 text-center space-y-1 max-w-xs">
                      <p className="text-xl font-black text-ink leading-snug">{displayMeaning}</p>
                      {current.meaningVi && current.meaning && (
                        <p className="text-xs font-medium text-ink/50 italic">{current.meaning}</p>
                      )}
                    </div>
                  )}
                  <Badge className="mt-3 bg-ink/10 text-ink border-0 font-black text-[10px] px-3">
                    {current.kanjiChar}
                  </Badge>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full border-2 border-ink/10 hover:bg-white hover:border-ink transition-all disabled:opacity-30"
            onClick={handlePrev}
            disabled={idx === 0}
            title="Previous (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            className={`h-14 px-10 rounded-2xl border-4 border-ink font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${
              revealed
                ? 'bg-ink text-white hover:bg-brand-primary hover:text-ink'
                : 'bg-white text-ink'
            }`}
            onClick={handleNext}
          >
            {!revealed ? (
              <><Eye className="mr-2 w-4 h-4" /> Reveal</>
            ) : idx < deck.length - 1 ? (
              <>Next <ChevronRight className="ml-2 w-4 h-4" /></>
            ) : (
              <>Finish <ChevronRight className="ml-2 w-4 h-4" /></>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full border-2 border-ink/10 hover:bg-white hover:border-ink transition-all disabled:opacity-30"
            onClick={handleNext}
            disabled={idx >= deck.length - 1 && revealed}
            title="Next (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-[10px] font-bold text-ink/20 uppercase tracking-widest hidden sm:block">
          Space · Enter · → to advance &nbsp;·&nbsp; ← to go back
        </p>
      </main>
    </div>
  );
};
