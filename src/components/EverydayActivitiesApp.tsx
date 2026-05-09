import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen, Volume2, FileText, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PDF_PATH = "/media/everyday/english-for-everyday-activities-pdf-free.pdf";
const AUDIO_DIR =
  "/media/everyday/english_for_everyday_activities_a_picture_process_dictionary_cd";

interface Chapter {
  num: number;
  title: string;
  section: string;
  pages: number[];
}

const CHAPTERS: Chapter[] = [
  // Section 1 – Starting the Day
  { num: 1,  title: "First Thing in the Morning",           section: "Starting the Day",        pages: [4, 5] },
  { num: 2,  title: "Brushing Your Teeth / Flossing",       section: "Starting the Day",        pages: [6] },
  { num: 3,  title: "Taking a Shower",                      section: "Starting the Day",        pages: [7] },
  { num: 4,  title: "Getting Dressed – A Man",              section: "Starting the Day",        pages: [8, 9] },
  { num: 5,  title: "Getting Dressed – A Woman",            section: "Starting the Day",        pages: [10, 11] },
  { num: 6,  title: "Making a Bed",                         section: "Starting the Day",        pages: [12] },
  { num: 7,  title: "Making Coffee / Making Tea",           section: "Starting the Day",        pages: [13] },
  { num: 8,  title: "Preparing Cold Cereal / Making Toast", section: "Starting the Day",        pages: [14] },
  { num: 9,  title: "Frying an Egg",                        section: "Starting the Day",        pages: [15] },
  { num: 10, title: "Eating Breakfast",                     section: "Starting the Day",        pages: [16] },
  { num: 11, title: "Leaving the House",                    section: "Starting the Day",        pages: [17] },
  // Section 2 – Getting Around
  { num: 12, title: "Taking a Bus",                         section: "Getting Around",          pages: [18, 19] },
  { num: 13, title: "Starting Out",                         section: "Getting Around",          pages: [20] },
  { num: 14, title: "Operating a Car",                      section: "Getting Around",          pages: [21] },
  { num: 15, title: "Driving Along",                        section: "Getting Around",          pages: [22, 23] },
  { num: 16, title: "Taking a Train",                       section: "Getting Around",          pages: [24] },
  { num: 17, title: "Taking a Taxi",                        section: "Getting Around",          pages: [25] },
  { num: 18, title: "Walking Somewhere",                    section: "Getting Around",          pages: [26] },
  { num: 19, title: "Riding a Bicycle",                     section: "Getting Around",          pages: [27] },
  // Section 3 – At Home in the Evening
  { num: 20, title: "Returning Home",                       section: "At Home in the Evening",  pages: [28, 29] },
  { num: 21, title: "Making a Salad",                       section: "At Home in the Evening",  pages: [30] },
  { num: 22, title: "Preparing Vegetables",                 section: "At Home in the Evening",  pages: [31] },
  { num: 23, title: "Making Spaghetti",                     section: "At Home in the Evening",  pages: [32, 33] },
  { num: 24, title: "Cooking Rice",                         section: "At Home in the Evening",  pages: [34] },
  { num: 25, title: "Eating Dinner",                        section: "At Home in the Evening",  pages: [35] },
  { num: 26, title: "Clearing the Table",                   section: "At Home in the Evening",  pages: [36] },
  { num: 27, title: "Doing Dishes",                         section: "At Home in the Evening",  pages: [37] },
  { num: 28, title: "Playing a CD",                         section: "At Home in the Evening",  pages: [38] },
  { num: 29, title: "Using a Personal Cassette Player",     section: "At Home in the Evening",  pages: [39] },
  { num: 30, title: "Reading",                              section: "At Home in the Evening",  pages: [40] },
  { num: 31, title: "Watching Television",                  section: "At Home in the Evening",  pages: [41] },
  { num: 32, title: "Watching a Video",                     section: "At Home in the Evening",  pages: [42] },
  { num: 33, title: "Babysitting",                          section: "At Home in the Evening",  pages: [43] },
  { num: 34, title: "Going to Bed",                         section: "At Home in the Evening",  pages: [44, 45] },
  // Section 4 – Managing a Household
  { num: 35, title: "Doing Laundry",                        section: "Managing a Household",    pages: [46, 47] },
  { num: 36, title: "Cleaning the House",                   section: "Managing a Household",    pages: [48, 49] },
  { num: 37, title: "Taking Care of a Cat",                 section: "Managing a Household",    pages: [50] },
  { num: 38, title: "Taking Care of a Dog",                 section: "Managing a Household",    pages: [51] },
  { num: 39, title: "Taking Care of a Lawn",                section: "Managing a Household",    pages: [52] },
  { num: 40, title: "Gardening",                            section: "Managing a Household",    pages: [53] },
  { num: 41, title: "Cleaning a Car",                       section: "Managing a Household",    pages: [54] },
  { num: 42, title: "Taking a Car to a Garage for Repairs", section: "Managing a Household",    pages: [55] },
  { num: 43, title: "Changing a Flat Tire",                 section: "Managing a Household",    pages: [56] },
  { num: 44, title: "Dealing with a Power Failure",         section: "Managing a Household",    pages: [57] },
  { num: 45, title: "Working with Wood",                    section: "Managing a Household",    pages: [58] },
  { num: 46, title: "Joining Things with Bolts / Screws",   section: "Managing a Household",    pages: [59] },
  { num: 47, title: "Shopping for Groceries",               section: "Managing a Household",    pages: [60, 61] },
  { num: 48, title: "Paying for Things",                    section: "Managing a Household",    pages: [62, 63] },
  { num: 49, title: "Going to a Bank",                      section: "Managing a Household",    pages: [64] },
  { num: 50, title: "Using an ATM",                         section: "Managing a Household",    pages: [65] },
  // Section 5 – Keeping in Touch
  { num: 51, title: "Making a Phone Call",                  section: "Keeping in Touch",        pages: [66] },
  { num: 52, title: "Answering a Telephone",                section: "Keeping in Touch",        pages: [67] },
  { num: 53, title: "Leaving a Message",                    section: "Keeping in Touch",        pages: [68] },
  { num: 54, title: "Taking a Message",                     section: "Keeping in Touch",        pages: [69] },
  { num: 55, title: "Using an Answering Machine",           section: "Keeping in Touch",        pages: [70] },
  { num: 56, title: "Writing a Personal Letter",            section: "Keeping in Touch",        pages: [71] },
  { num: 57, title: "Mailing a Letter",                     section: "Keeping in Touch",        pages: [72, 73] },
  // Section 6 – Having Fun with Friends
  { num: 58, title: "Going to a Birthday Party",            section: "Having Fun with Friends", pages: [74] },
  { num: 59, title: "Going to a Dinner Party",              section: "Having Fun with Friends", pages: [75] },
  { num: 60, title: "Going to a Movie",                     section: "Having Fun with Friends", pages: [76] },
  { num: 61, title: "Eating at a Fast Food Restaurant",     section: "Having Fun with Friends", pages: [77] },
];

const SECTIONS = [...new Set(CHAPTERS.map(c => c.section))];

interface VocabItem {
  term: string;
  section: string;
  vi: string;
  ipa: string;
}

interface NoteBullet {
  marker: string;
  en: string;
  vi: string;
}

function pdfUrl(page: number, zoom: number) {
  return `${PDF_PATH}#page=${page}&toolbar=0&navpanes=0&scrollbar=${zoom > 100 ? 1 : 0}&zoom=${zoom}`;
}

function audioUrl(num: number) {
  const n = String(num).padStart(2, "0");
  return `${AUDIO_DIR}/English%20for%20Everyday%20Activities%20${n}.mp3`;
}

function speakTTS(text: string) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
}

function speak(text: string) {
  const word = text.trim().toLowerCase();
  if (word.includes(" ")) { speakTTS(text); return; }
  const prefix1 = word[0];
  const prefix3 = word.slice(0, 3);
  const url = `https://www.oxfordlearnersdictionaries.com/media/english/us_pron/${prefix1}/${prefix3}/${word}/${word}__us_1.mp3`;
  const audio = new Audio(url);
  audio.onerror = () => speakTTS(text);
  audio.play().catch(() => speakTTS(text));
}

function decodeHtml(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface Props {
  onBack: () => void;
}

export const EverydayActivitiesApp: React.FC<Props> = ({ onBack }) => {
  const [idx, setIdx] = useState(0);
  const [vocab, setVocab] = useState<Record<number, VocabItem[]>>({});
  const [notes, setNotes] = useState<Record<number, NoteBullet[]>>({});
  const [lessonMd, setLessonMd] = useState<Record<number, string>>({});
  const [showLessonNote, setShowLessonNote] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<VocabItem | null>(null);
  const [showList, setShowList] = useState(true);
  const [showVocab, setShowVocab] = useState(true);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [vocabFontSize, setVocabFontSize] = useState(11);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chapterRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const chapter = CHAPTERS[idx];
  const chapterVocab = vocab[chapter.num] ?? [];
  const chapterNotes = notes[chapter.num] ?? [];
  const chapterLessonMd = lessonMd[chapter.num] ?? "";
  const hasVocab = chapterVocab.length > 0 || chapterNotes.length > 0 || !!chapterLessonMd;

  useEffect(() => {
    fetch("/media/everyday/vocab.json")
      .then(r => r.json())
      .then(setVocab)
      .catch(() => {});
    fetch("/media/everyday/notes.json")
      .then(r => r.json())
      .then(setNotes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const num = chapter.num;
    if (lessonMd[num] !== undefined) return;
    fetch(`/media/everyday/lesson-notes-${num}.md`)
      .then(r => r.ok ? r.text() : "")
      .then(text => setLessonMd(prev => ({ ...prev, [num]: text })))
      .catch(() => setLessonMd(prev => ({ ...prev, [num]: "" })));
  }, [chapter.num]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback((i: number) => {
    setIdx(i);
    setSelectedTerm(null);
    setShowLessonNote(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const prev = useCallback(() => { if (idx > 0) goTo(idx - 1); }, [idx, goTo]);
  const next = useCallback(() => { if (idx < CHAPTERS.length - 1) goTo(idx + 1); }, [idx, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  useEffect(() => {
    chapterRefs.current[idx]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [idx]);

  useEffect(() => {
    audioRef.current?.load();
  }, [idx]);

  const vocabBySec = chapterVocab.reduce<Record<string, VocabItem[]>>((acc, item) => {
    (acc[item.section] ??= []).push(item);
    return acc;
  }, {});
  const vocabSections = Object.keys(vocabBySec);

  return (
    <div className="relative h-screen bg-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b-2 border-ink/10 flex items-center justify-between px-4 shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-brand-primary rounded-lg border-2 border-ink flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-ink" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="font-black text-sm tracking-tight leading-none uppercase">Everyday Activities</h1>
            <p className="text-[10px] font-bold text-ink/40 leading-none mt-0.5 truncate">
              {chapter.num}. {chapter.title}
            </p>
          </div>

          {/* Drawer toggles */}
          <div className="flex items-center gap-1 sm:ml-2">
            <button
              onClick={() => setShowList(v => !v)}
              title="Toggle lesson list"
              className={`flex items-center gap-1 h-7 px-2 rounded-lg border-2 transition-colors ${showList ? 'bg-brand-primary border-ink' : 'border-ink/10 text-ink/30 hover:border-ink/30'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[9px] font-black uppercase tracking-wide">Lessons</span>
            </button>
            <button
              onClick={() => setShowVocab(v => !v)}
              title="Toggle vocabulary"
              className={`flex items-center gap-1 h-7 px-2 rounded-lg border-2 transition-colors ${showVocab ? 'bg-brand-primary border-ink' : 'border-ink/10 text-ink/30 hover:border-ink/30'}`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[9px] font-black uppercase tracking-wide">Vocab</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-ink/30">{idx + 1} / {CHAPTERS.length}</span>
          <Button
            variant="ghost" size="sm"
            className="font-black text-ink/40 hover:text-ink text-xs uppercase"
            onClick={onBack}
          >
            <X className="mr-1 w-4 h-4" /> Close
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left drawer — chapter list */}
        <aside className={`shrink-0 border-r-2 border-ink/10 overflow-hidden bg-ink/[0.015] transition-all duration-200 ${showList ? 'w-52' : 'w-0 border-r-0'}`}>
          <div className="w-52 h-full overflow-y-auto">
            {SECTIONS.map(section => (
              <div key={section}>
                <p className="px-3 pt-4 pb-1 text-[9px] font-black uppercase tracking-widest text-ink/30">
                  {section}
                </p>
                {CHAPTERS.filter(c => c.section === section).map(c => {
                  const i = c.num - 1;
                  const active = i === idx;
                  return (
                    <button
                      key={c.num}
                      ref={el => { chapterRefs.current[i] = el; }}
                      onClick={() => goTo(i)}
                      className={`w-full text-left px-3 py-2 flex items-start gap-2 transition-colors ${
                        active ? "bg-brand-primary border-r-4 border-ink" : "hover:bg-ink/5"
                      }`}
                    >
                      <span className={`text-[10px] font-black shrink-0 w-5 text-right mt-px ${active ? "text-ink" : "text-ink/30"}`}>
                        {c.num}
                      </span>
                      <span className={`text-[11px] font-bold leading-tight ${active ? "text-ink" : "text-ink/60"}`}>
                        {c.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Main — PDF + audio/nav */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* PDF pages */}
          <div className="flex-1 flex gap-2 p-3 min-h-0 overflow-auto">
            {chapter.pages.map(page => (
              <iframe
                key={`${chapter.num}-${page}-${pdfZoom}`}
                src={pdfUrl(page, pdfZoom)}
                className="flex-1 h-full border-2 border-ink/10 rounded-2xl bg-white"
                style={{ minWidth: pdfZoom > 100 ? `${pdfZoom}%` : undefined }}
                title={`Chapter ${chapter.num} page ${page}`}
              />
            ))}
          </div>

          {/* Audio + nav + pdf zoom */}
          <div className="shrink-0 border-t-2 border-ink/10 px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost" size="icon"
              className="w-9 h-9 rounded-full border-2 border-ink/10 hover:border-ink transition-all disabled:opacity-30"
              onClick={prev} disabled={idx === 0} title="Previous (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <audio ref={audioRef} controls className="flex-1 h-9" src={audioUrl(chapter.num)} />

            {/* PDF zoom */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setPdfZoom(z => Math.max(75, z - 25))}
                disabled={pdfZoom <= 75}
                className="w-7 h-7 flex items-center justify-center rounded-lg border-2 border-ink/10 hover:border-ink font-black text-xs text-ink/50 hover:text-ink transition-all disabled:opacity-30"
              >A-</button>
              <span className="text-[10px] font-black text-ink/30 w-8 text-center">{pdfZoom}%</span>
              <button
                onClick={() => setPdfZoom(z => Math.min(200, z + 25))}
                disabled={pdfZoom >= 200}
                className="w-7 h-7 flex items-center justify-center rounded-lg border-2 border-ink/10 hover:border-ink font-black text-xs text-ink/50 hover:text-ink transition-all disabled:opacity-30"
              >A+</button>
            </div>

            <Button
              variant="ghost" size="icon"
              className="w-9 h-9 rounded-full border-2 border-ink/10 hover:border-ink transition-all disabled:opacity-30"
              onClick={next} disabled={idx === CHAPTERS.length - 1} title="Next (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </main>

        {/* Right drawer — vocabulary + notes */}
        <aside className={`shrink-0 border-l-2 border-ink/10 overflow-hidden bg-ink/[0.015] transition-all duration-200 ${showVocab ? 'w-52' : 'w-0 border-l-0'}`}>
          <div className="w-52 h-full flex flex-col overflow-hidden">

            {/* Vocab font size slider */}
            <div className="shrink-0 px-3 pt-3 pb-2 border-b-2 border-ink/5 flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-ink/30 shrink-0">A</span>
              <input
                type="range" min={9} max={18} value={vocabFontSize}
                onChange={e => setVocabFontSize(+e.target.value)}
                className="flex-1 accent-[#FFD93D] h-1 cursor-pointer"
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-ink/30 shrink-0 text-base leading-none">A</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Vocabulary */}
              {chapterVocab.length > 0 && (
                <>
                  <p className="px-3 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest text-ink/30">
                    Key Vocabulary
                  </p>
                  {vocabSections.map(sec => (
                    <div key={sec}>
                      <p className="px-3 pt-2 pb-0.5 text-[8px] font-black uppercase tracking-widest text-ink/20">
                        {sec}
                      </p>
                      {vocabBySec[sec].map(item => {
                        const active = selectedTerm?.term === item.term;
                        return (
                          <button
                            key={item.term}
                            onClick={() => { speak(item.term); setSelectedTerm(active ? null : item); }}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                              active ? "bg-brand-primary font-bold text-ink" : "font-medium text-ink/70 hover:bg-ink/5"
                            }`}
                            style={{ fontSize: `${vocabFontSize}px` }}
                          >
                            <Volume2 className={`shrink-0 ${active ? 'text-ink/50' : 'text-ink/20'}`} style={{ width: `${Math.max(10, vocabFontSize - 2)}px`, height: `${Math.max(10, vocabFontSize - 2)}px` }} />
                            {item.term}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}

              {/* Special attention notes */}
              {chapterNotes.length > 0 && (
                <>
                  <p className="px-3 pt-4 pb-1 text-[9px] font-black uppercase tracking-widest text-ink/30 border-t-2 border-ink/10 mt-2">
                    Special Attention
                  </p>
                  {chapterNotes.map((note, i) => (
                    <div key={i} className="px-3 py-2 border-b border-ink/5">
                      <p className="font-medium text-ink/60 leading-snug" style={{ fontSize: `${vocabFontSize}px` }}>
                        <span className="font-black text-ink/40">{note.marker}</span>{" "}
                        {note.en}
                      </p>
                      {note.vi && (
                        <p className="text-ink font-semibold mt-1 leading-snug" style={{ fontSize: `${vocabFontSize}px` }}>
                          {decodeHtml(note.vi)}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Lesson notes button */}
              {chapterLessonMd && (
                <div className="px-3 pt-4 pb-3 border-t-2 border-ink/10 mt-2">
                  <button
                    onClick={() => setShowLessonNote(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-brand-primary border-2 border-ink rounded-xl font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all"
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    Lesson Notes
                  </button>
                </div>
              )}

              {!hasVocab && (
                <div className="flex items-center justify-center h-24 text-ink/20 font-black text-[10px] uppercase tracking-widest">
                  No vocabulary
                </div>
              )}
            </div>

            {/* Vocab detail card */}
            {selectedTerm && (
              <div className="shrink-0 border-t-2 border-ink/10 p-3 bg-white">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-black text-ink leading-tight flex-1">{selectedTerm.term}</p>
                  <button
                    onClick={() => speak(selectedTerm.term)}
                    className="text-ink/30 hover:text-ink/70 transition-colors"
                    title="Listen"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {selectedTerm.ipa && (
                  <p className="text-[10px] text-ink/40 font-medium mt-0.5">{selectedTerm.ipa}</p>
                )}
                {selectedTerm.vi && (
                  <p className="text-[11px] text-ink font-semibold mt-1 leading-snug">
                    {decodeHtml(selectedTerm.vi)}
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Lesson notes modal */}
      {showLessonNote && chapterLessonMd && (
        <div
          className="absolute inset-0 bg-ink/40 flex items-center justify-center p-6 z-50"
          onClick={() => setShowLessonNote(false)}
        >
          <div
            className="bg-white border-4 border-ink rounded-3xl shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] w-full max-w-2xl max-h-full flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-black text-sm uppercase tracking-tight">
                  Lesson Notes — {chapter.num}. {chapter.title}
                </span>
              </div>
              <button
                onClick={() => setShowLessonNote(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 prose prose-sm max-w-none
              [&_h1]:text-xl [&_h1]:font-black [&_h1]:mt-0 [&_h1]:mb-3
              [&_h2]:text-base [&_h2]:font-black [&_h2]:mt-5 [&_h2]:mb-2
              [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-1
              [&_p]:text-sm [&_p]:leading-relaxed [&_p]:my-1
              [&_strong]:font-black
              [&_hr]:border-ink/10 [&_hr]:my-4
              [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
              [&_th]:text-left [&_th]:font-black [&_th]:px-3 [&_th]:py-2 [&_th]:bg-ink/5 [&_th]:border [&_th]:border-ink/10
              [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-ink/10 [&_td]:align-top">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {chapterLessonMd}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
