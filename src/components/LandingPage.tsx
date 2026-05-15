import React, { useState, createContext, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { BookOpen, GraduationCap, Users, User, MessageCircle, CheckCircle2, ArrowRight, Instagram, Facebook, Mail, Phone, MapPin, Globe, Briefcase, Mic, Smile, PenTool, Trophy, MessageSquare, X, Smartphone, Wifi, Clock, CheckSquare, Heart, Sparkles, Laptop, Calendar, Code, Rocket, PlayCircle, Play, Menu, ChevronLeft, ChevronRight, FileText, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translations } from "../translations";
import { VocabularyApp } from "./VocabularyApp";
import { MoversLetsTalkApp } from "./MoversLetsTalkApp";
import { StudentManagerApp } from "./StudentManagerApp";
import { MoversQuizApp } from "./MoversQuizApp";
import { KanjiApp } from "./KanjiApp";
import { KanjiQuizApp } from "./KanjiQuizApp";
import { EverydayActivitiesApp } from "./EverydayActivitiesApp";
import { PracticeQuizApp } from "./PracticeQuizApp";
import studentsData from "../data/students.json";
import appsConfig from "../data/apps.json";
import testimonialsData from "../data/testimonials.json";

type Language = "en" | "vi";
const LanguageContext = createContext<{ 
  lang: Language; 
  setLang: (l: Language) => void; 
  t: typeof translations.en;
  view: "home" | "appstore";
  setView: (v: "home" | "appstore") => void;
} | null>(null);

const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
};

const Navbar = () => {
  const { lang, setLang, t, view, setView } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-md border-b border-ink/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setView("home")}
        >
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-ink font-black text-xl">S</div>
          <span className="font-black text-2xl text-ink tracking-tighter">Suzy Ruan</span>
        </div>
        
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-10 text-sm font-bold text-ink/70">
            <li><a href="#about" className="hover:text-brand-primary transition-colors">{t.nav.home}</a></li>
            <li><a href="#app-store" className="hover:text-brand-primary transition-colors">{t.nav.appStore}</a></li>
            <li><a href="#programs" className="hover:text-brand-primary transition-colors">{t.nav.courses}</a></li>
            <li><a href="#careers" className="hover:text-brand-primary transition-colors">{t.nav.jobs}</a></li>
            <li><a href="#contact" className="hover:text-brand-primary transition-colors">{t.nav.contact}</a></li>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex bg-ink/5 p-1 rounded-xl border border-ink/10">
            <button 
              onClick={() => setLang("en")}
              className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${lang === "en" ? "bg-brand-primary text-ink shadow-sm" : "text-ink/40 hover:text-ink"}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang("vi")}
              className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${lang === "vi" ? "bg-brand-primary text-ink shadow-sm" : "text-ink/40 hover:text-ink"}`}
            >
              VI
            </button>
          </div>
          <Button 
            className="bg-brand-primary text-ink hover:bg-brand-primary/90 rounded-full px-8 font-black hidden sm:flex shadow-lg shadow-brand-primary/20"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t.nav.join}
          </Button>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden w-10 h-10 bg-ink/5 rounded-xl flex items-center justify-center text-ink hover:bg-brand-primary transition-colors border border-ink/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-ink/5 overflow-hidden"
          >
            <div className="px-6 py-10 space-y-8">
              <nav>
                <ul className="flex flex-col gap-6 text-2xl font-black text-ink">
                  <li>
                    <a 
                      href="#about" 
                      onClick={() => setIsMenuOpen(false)}
                      className="hover:text-brand-primary transition-colors"
                    >
                      {t.nav.home}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#app-store"
                      onClick={() => setIsMenuOpen(false)}
                      className="hover:text-brand-primary transition-colors"
                    >
                      {t.nav.appStore}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#programs"
                      onClick={() => setIsMenuOpen(false)}
                      className="hover:text-brand-primary transition-colors"
                    >
                      {t.nav.courses}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#careers"
                      onClick={() => setIsMenuOpen(false)}
                      className="hover:text-brand-primary transition-colors"
                    >
                      {t.nav.jobs}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      onClick={() => setIsMenuOpen(false)}
                      className="hover:text-brand-primary transition-colors"
                    >
                      {t.nav.contact}
                    </a>
                  </li>
                </ul>
              </nav>
              <Button 
                className="w-full bg-brand-primary text-ink rounded-2xl h-16 font-black text-xl border-4 border-ink shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]"
                onClick={() => {
                  setIsMenuOpen(false);
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t.nav.join}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative py-40 md:py-64 bg-brand-primary min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8 tracking-tighter text-ink">
            {t.hero.title1} <br />
            {t.hero.title2}
          </h1>
          <p className="text-xl text-ink/80 mb-10 max-w-lg leading-relaxed font-bold">
            {t.hero.desc}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-white text-ink rounded-full px-10 h-16 text-lg font-black shadow-2xl hover:scale-105 transition-transform"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.hero.cta1}
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:ml-auto"
        >
          <div className="relative w-full max-w-[550px] aspect-square flex items-center justify-center mx-auto">
             {/* Main Avatar Container */}
             <div className="relative w-[340px] h-[340px] md:w-[480px] md:h-[480px] z-10">
               <div className="absolute inset-0 bg-brand-accent rounded-full border-8 border-ink shadow-[25px_25px_0px_0px_rgba(45,52,54,1)] overflow-hidden">
                 <img 
                   src="/ms-suzy-avatar.png" 
                   alt="Ms. Suzy" 
                   className="w-full h-full object-cover scale-110" 
                   referrerPolicy="no-referrer" 
                 />
               </div>
               
               {/* Label in the avatar style */}
               <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-10 py-4 border-4 border-ink rounded-[20px] shadow-xl z-30">
                 <div className="flex flex-col items-center">
                   <span className="font-black text-3xl text-ink whitespace-nowrap leading-none">Ms. Suzy</span>
                   <div className="flex gap-1 mt-1">
                      {[1,2,3,4,5].map(s => <Sparkles key={s} className="w-3 h-3 text-brand-primary fill-current" />)}
                   </div>
                 </div>
               </div>
             </div>

             {/* Floating Elements - The "Hole in the Wall" approach to design */}
             
             {/* Tag 1: IELTS & TOEIC (Course) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
               animate={{ opacity: 1, scale: 1, rotate: [-3, -1, -3], y: [0, -5, 0] }}
               transition={{ 
                 duration: 0.8, 
                 delay: 1.2,
                 rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                 y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
               }}
               className="absolute top-0 -left-12 w-28 h-28 bg-white rounded-3xl border-4 border-ink shadow-xl p-3 flex flex-col items-center justify-center z-20 hidden sm:flex"
             >
               <Trophy className="w-6 h-6 text-brand-primary mb-1" />
               <div className="text-lg font-black text-ink leading-tight text-center">{t.hero.tags.ielts}</div>
             </motion.div>

             {/* Tag 2: Communication (Course) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, x: 20 }}
               animate={{ opacity: 1, scale: 1, x: 0, y: [0, 8, 0], rotate: [2, 4, 2] }}
               transition={{ 
                 duration: 0.8, 
                 delay: 1.4,
                 y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                 rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
               }}
               className="absolute top-4 -right-10 w-60 bg-white rounded-2xl border-4 border-ink shadow-xl p-4 z-20 hidden sm:block"
             >
               <div className="flex items-center gap-2 mb-1">
                 <div className="w-3 h-3 rounded-full bg-green-500 border border-ink" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-ink/40">Active</span>
               </div>
               <div className="text-xl font-black text-ink">{t.hero.tags.communication}</div>
               <div className="text-[10px] font-bold text-ink/60">Real-world practice</div>
             </motion.div>

             {/* Tag 3: Expert Teachers (Advantage) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, x: -20 }}
               animate={{ opacity: 1, scale: 1, x: [0, 4, 0], y: [0, -4, 0] }}
               transition={{ 
                 duration: 0.8, 
                 delay: 1.6,
                 x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                 y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
               }}
               className="absolute top-1/2 -left-20 w-36 bg-brand-primary rounded-2xl border-4 border-ink shadow-xl p-3 z-20 -rotate-6 hidden md:block"
             >
                <div className="w-8 h-8 bg-white rounded-xl border-2 border-ink flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-brand-primary" />
                </div>
               <div className="text-xs font-black text-ink uppercase tracking-tight">{t.hero.tags.teachers}</div>
               <div className="text-[10px] font-bold text-ink/60">Global Pedigree</div>
             </motion.div>

             {/* Tag 4: Personalized (Advantage) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, y: 0, scale: [1, 1.015, 1], rotate: [1, 0, 1] }}
               transition={{ 
                 duration: 0.8, 
                 delay: 1.8,
                 scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                 rotate: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
               }}
               className="absolute bottom-10 -right-16 w-48 bg-brand-secondary rounded-2xl border-4 border-ink shadow-xl p-4 z-20 hidden md:block"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-white rounded-lg border-2 border-ink flex items-center justify-center shrink-0">
                   <PenTool className="w-5 h-5 text-brand-primary" />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-ink uppercase leading-none">Custom</div>
                    <div className="text-base font-black text-ink leading-tight">{t.hero.tags.personalized}</div>
                 </div>
               </div>
             </motion.div>

             {/* Tag 5: Chinese Mastery (Course) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, x: -20 }}
               animate={{ opacity: 1, scale: 1, y: [0, -6, 0], x: [0, 3, 0] }}
               transition={{ 
                 duration: 0.8, 
                 delay: 1.3,
                 y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                 x: { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
               }}
               className="absolute top-24 -left-16 w-28 bg-white rounded-2xl border-4 border-ink shadow-lg p-3 z-10 hidden lg:block"
             >
               <div className="text-[10px] font-black text-red-500 uppercase mb-1 whitespace-nowrap">HSK Prep</div>
               <div className="text-base font-black text-ink leading-none">{t.hero.tags.chinese}</div>
             </motion.div>

             {/* Tag 6: CEFR (Course) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, x: 20 }}
               animate={{ opacity: 1, scale: 1, rotate: [-1, 1, -1], y: [0, 6, 0] }}
               transition={{ 
                 duration: 0.8, 
                 delay: 1.5,
                 rotate: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
                 y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
               }}
               className="absolute top-40 -right-16 bg-brand-accent p-3 rounded-2xl border-4 border-ink shadow-xl z-20 hidden lg:block"
             >
               <div className="text-white font-black text-[10px] uppercase tracking-widest">{t.hero.tags.cefr}</div>
             </motion.div>

             {/* Tag 7: Interview Prep (Course) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, y: 10 }}
               animate={{ opacity: 1, scale: 1, x: [0, -5, 0] }}
               transition={{ 
                 duration: 0.8, 
                 delay: 1.7,
                 x: { duration: 5, repeat: Infinity, ease: "easeInOut" }
               }}
               className="absolute bottom-4 -left-12 bg-white px-3 py-2 rounded-xl border-4 border-ink shadow-lg z-20 hidden sm:block"
             >
               <div className="flex items-center gap-2">
                 <Briefcase className="w-4 h-4 text-brand-primary" />
                 <span className="font-black text-ink text-xs">{t.hero.tags.interview}</span>
               </div>
             </motion.div>

             {/* Tag 8: Flexible (Advantage) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: 1, scale: [1, 1.05, 1] }}
               transition={{ 
                 duration: 0.8, 
                 delay: 1.9,
                 scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
               }}
               className="absolute top-1/2 -right-20 bg-ink text-white px-2 py-1.5 rounded-lg border-2 border-white rotate-12 z-10 hidden md:block"
             >
               <div className="text-[8px] font-black uppercase tracking-widest">{t.hero.tags.flexible}</div>
             </motion.div>

             {/* Background Aura */}
             <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-[120px] -z-10" />
          </div>
        </motion.div>
      </div>
      {/* Background Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
    </section>
  );
};

const Intro = () => {
  const { t } = useTranslation();
  const intro = t.intro;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mic': return <Mic className="w-8 h-8" />;
      case 'Smartphone': return <Smartphone className="w-8 h-8" />;
      case 'Globe': return <Globe className="w-8 h-8" />;
      default: return <Sparkles className="w-8 h-8" />;
    }
  };

  return (
    <section className="bg-white py-32 overflow-hidden border-b-8 border-ink">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          {/* Text Content */}
          <div className="lg:w-3/5 space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-brand-accent border-2 border-ink rounded-lg font-black text-ink uppercase tracking-widest text-xs mb-6 shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]"
              >
                {intro.subtitle}
              </motion.div>
              <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-ink leading-[0.85]">
                {intro.title.split(/(Ms\. Suzy Ruan|Suzy Ruan)/).map((part: string, i: number) => 
                  /(Ms\. Suzy Ruan|Suzy Ruan)/.test(part) 
                    ? <span key={i} className="text-brand-primary">{part}</span> 
                    : part
                )}
              </h2>
              <p className="text-xl md:text-2xl text-ink/70 font-bold leading-relaxed max-w-2xl border-l-8 border-brand-primary pl-8">
                {intro.mainText.split(/(Ms\. Suzy Ruan|Suzy Ruan)/).map((part: string, i: number) => 
                  /(Ms\. Suzy Ruan|Suzy Ruan)/.test(part) 
                    ? <span key={i} className="text-brand-primary">{part}</span> 
                    : part
                )}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 pt-8">
              {intro.pillars.map((pillar: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4 group"
                >
                  <div className="w-16 h-16 bg-brand-secondary rounded-2xl border-4 border-ink flex items-center justify-center text-ink shadow-[6px_6px_0px_0px_rgba(45,52,54,1)] group-hover:bg-brand-primary transition-colors">
                    {getIcon(pillar.icon)}
                  </div>
                  <h4 className="text-xl font-black text-ink uppercase tracking-tight">{pillar.title}</h4>
                  <p className="text-sm text-ink/60 font-bold leading-snug">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual Element */}
          <div className="lg:w-2/5 relative h-[400px] md:h-[500px] hidden md:flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative w-full h-full"
            >
              {/* Central Floating Card */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [-2, 2, -2]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white border-8 border-ink rounded-[40px] shadow-[20px_20px_0px_0px_rgba(45,52,54,1)] flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-24 h-24 bg-brand-primary rounded-full border-4 border-ink flex items-center justify-center mb-6 shadow-md">
                   <BookOpen className="w-12 h-12 text-ink" />
                </div>
                <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tighter leading-none mb-2">Ms. Suzy</h3>
                <p className="text-xs font-black text-brand-primary uppercase tracking-widest bg-ink px-3 py-1 rounded-full">Methodology</p>
              </motion.div>

              {/* Decorative Geometric Elements */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] border-[8px] md:border-[16px] border-dashed border-brand-secondary/30 rounded-full z-0"
              />

              {/* Floating Floating Icons */}
              <motion.div
                animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-10 right-10 z-30 bg-brand-accent p-5 rounded-3xl border-4 border-ink shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]"
              >
                <Globe className="w-10 h-10 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -30, 0], x: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-10 left-0 z-30 bg-brand-primary p-5 rounded-3xl border-4 border-ink shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] rotate-12"
              >
                <Mic className="w-10 h-10 text-ink" />
              </motion.div>

              <motion.div
                animate={{ rotate: [-10, 10, -10], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-1/4 -left-10 z-10 w-20 h-20 bg-ink rounded-full border-4 border-white flex items-center justify-center shadow-xl"
              >
                <GraduationCap className="w-10 h-10 text-brand-primary" />
              </motion.div>

              {/* Accent Circles */}
              <div className="absolute top-0 left-1/2 w-4 h-4 bg-brand-accent rounded-full border-2 border-ink" />
              <div className="absolute bottom-1/4 right-0 w-8 h-8 bg-brand-secondary rounded-full border-4 border-ink" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

const Programs = () => {
  const { t } = useTranslation();
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const programList = [
    { key: 'communication', icon: <MessageSquare className="w-12 h-12" /> },
    { key: 'testprep', icon: <Trophy className="w-12 h-12" /> },
    { key: 'cefr', icon: <GraduationCap className="w-12 h-12" /> },
    { key: 'foundation', icon: <Smile className="w-12 h-12" /> },
    { key: 'interview', icon: <Briefcase className="w-12 h-12" /> },
    { key: 'chinese', icon: <Globe className="w-12 h-12" /> },
  ];

  return (
    <section id="programs" className="bg-brand-primary py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-ink">{t.programs.title}</h2>
          <p className="text-xl text-ink/70 font-bold max-w-2xl mx-auto">{t.programs.desc}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {programList.map((item, i) => {
            const prog = (t.programs.items as any)[item.key];
            return (
              <motion.div 
                key={i} 
                className="text-center group cursor-pointer"
                onClick={() => setSelectedProgram(prog)}
                whileHover={{ y: -10 }}
              >
                <div className="w-48 h-48 bg-white rounded-[40px] mx-auto mb-8 flex items-center justify-center text-brand-primary shadow-xl group-hover:scale-105 transition-transform border-4 border-transparent group-hover:border-ink">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 text-ink">{prog.title}</h3>
                <p className="text-ink/70 font-bold text-sm leading-relaxed px-4 mb-4">{prog.desc}</p>
                <Button variant="link" className="text-ink font-black hover:no-underline group-hover:translate-x-2 transition-transform">
                  {t.programs.learnMore} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedProgram && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/60 backdrop-blur-sm"
            onClick={() => setSelectedProgram(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[48px] border-4 border-ink shadow-[20px_20px_0px_0px_rgba(45,52,54,1)] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 md:p-12 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProgram(null)}
                className="absolute top-8 right-8 w-10 h-10 bg-ink/5 rounded-full flex items-center justify-center hover:bg-brand-primary transition-colors group"
              >
                <X className="w-6 h-6 text-ink group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="mb-10">
                <Badge className="bg-brand-primary text-ink font-black mb-4">{t.programs.modalBadge}</Badge>
                <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-ink leading-none">{selectedProgram.title}</h3>
                <p className="text-xl text-soft-ink font-bold leading-relaxed">{selectedProgram.desc}</p>
              </div>
              
              <div className="space-y-10">
                <div className="p-6 bg-brand-accent/10 rounded-3xl border-2 border-ink/5">
                  <h4 className="text-xs uppercase tracking-widest font-black text-ink/40 mb-3">{t.programs.curriculumLabel}</h4>
                  <p className="font-black text-lg text-ink leading-snug">{selectedProgram.details.curriculum}</p>
                </div>
                
                {selectedProgram.details.sections.map((section: any, idx: number) => (
                  <div key={idx}>
                    <h4 className="text-xs uppercase tracking-widest font-black text-brand-primary mb-6 flex items-center gap-2">
                      <div className="h-px flex-1 bg-brand-primary/20" />
                      {section.title}
                      <div className="h-px flex-1 bg-brand-primary/20" />
                    </h4>
                    <ul className="space-y-4">
                      {section.items.map((item: string, itemIdx: number) => (
                        <li key={itemIdx} className="flex gap-4 items-start font-bold text-ink/80 text-lg">
                          <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center shrink-0 mt-1">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t-4 border-ink/5">
                <Button className="w-full bg-brand-primary text-ink hover:bg-brand-primary/90 h-16 rounded-2xl text-xl font-black shadow-xl" onClick={() => setSelectedProgram(null)}>
                  {t.programs.closeModal}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Features = () => {
  const { t } = useTranslation();
  const featureIcons = [Calendar, Users, BookOpen, Laptop, MessageSquare, Heart];

  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-none text-ink mx-auto max-w-4xl">
              {t.features.whyTitle}
            </h2>
            <p className="text-xl text-ink/60 font-bold mb-10 leading-relaxed max-w-2xl mx-auto">
              {t.features.whySubtitle}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.features.items.map((item, i) => {
            const Icon = featureIcons[i % featureIcons.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white p-8 rounded-[40px] border-4 border-ink shadow-[10px_10px_0px_0px_rgba(45,52,54,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <div className="w-14 h-14 bg-brand-accent rounded-2xl flex items-center justify-center mb-6 border-2 border-ink group-hover:bg-brand-primary transition-colors">
                  <Icon className="w-7 h-7 text-ink" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-ink leading-tight">{item.title}</h3>
                <p className="text-ink/60 font-bold leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const StudentRequirements = () => {
  const { t } = useTranslation();
  const icons = [Smartphone, Wifi, Clock, PenTool, MessageSquare, Heart];

  return (
    <section className="py-24 bg-brand-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">{t.requirements.title}</h2>
          <p className="text-xl text-ink/60 font-bold max-w-2xl mx-auto">{t.requirements.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.requirements.items.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl border-4 border-ink shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center mb-6 border-2 border-ink">
                  <Icon className="w-7 h-7 text-ink" />
                </div>
                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                <p className="text-ink/70 font-bold leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CareerRecruitment = () => {
  const { t } = useTranslation();
  const [activeRole, setActiveRole] = useState<null | number>(null);
  const roleIcons = [GraduationCap, Calendar, Code];

  return (
    <section id="careers" className="py-24 bg-brand-secondary/20 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-brand-primary text-ink mb-6 px-4 py-1 text-sm font-black rounded-full border-2 border-ink">
            <Sparkles className="w-3 h-3 mr-2 fill-current" />
            {t.recruitment.badge}
          </Badge>
          <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-none mx-auto max-w-4xl text-ink">
            {t.recruitment.title}
          </h2>
          <p className="text-xl text-ink/70 font-bold mb-10 leading-relaxed max-w-2xl mx-auto">
            {t.recruitment.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {t.recruitment.roles.map((role: any, idx: number) => {
            const Icon = roleIcons[idx % roleIcons.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveRole(idx)}
                className="bg-white p-8 rounded-[40px] border-4 border-ink shadow-[10px_10px_0px_0px_rgba(45,52,54,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 border-2 border-ink group-hover:bg-brand-primary transition-colors relative">
                  <Icon className="w-8 h-8 text-ink" />
                  {role.isClosed && (
                    <div className="absolute -top-2 -right-2 bg-ink text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white uppercase tracking-tighter">
                      {t.recruitment.closedLabel}
                    </div>
                  )}
                </div>
                <h3 className={`text-2xl font-black mb-4 group-hover:text-brand-primary transition-colors leading-tight ${role.isClosed ? 'text-ink/40' : 'text-ink'}`}>{role.title}</h3>
                <p className={`font-medium leading-relaxed mb-6 ${role.isClosed ? 'text-ink/30' : 'text-ink/60'}`}>{role.desc}</p>
                <div className="flex items-center text-ink font-black gap-2 group-hover:gap-3 transition-all">
                  {t.programs.learnMore} <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {activeRole !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveRole(null)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[48px] border-4 border-ink shadow-[20px_20px_0px_0px_rgba(45,52,54,1)] overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 sm:p-12 overflow-y-auto">
                <button 
                  onClick={() => setActiveRole(null)}
                  className="absolute top-8 right-8 w-12 h-12 bg-ink/5 rounded-2xl flex items-center justify-center hover:bg-brand-primary transition-colors group"
                >
                  <X className="w-6 h-6 text-ink" />
                </button>

                <Badge className={`${t.recruitment.roles[activeRole].isClosed ? 'bg-ink/10 text-ink/40' : 'bg-brand-secondary text-ink'} mb-6 px-4 py-1 text-xs font-black rounded-full border-2 border-ink`}>
                  {t.recruitment.roles[activeRole].isClosed ? t.recruitment.closedLabel : 'Job Details'}
                </Badge>
                
                <h3 className="text-3xl sm:text-4xl font-black text-ink mb-8 tracking-tighter leading-none">
                  {t.recruitment.roles[activeRole].title}
                </h3>

                <div className="space-y-10">
                  <section>
                    <h4 className="text-xs uppercase tracking-[0.2em] font-black text-ink/40 mb-4">Description</h4>
                    <p className="text-lg font-bold text-ink/80 leading-relaxed">
                      {t.recruitment.roles[activeRole].details.description}
                    </p>
                  </section>

                  <section>
                    <h4 className="text-xs uppercase tracking-[0.2em] font-black text-ink/40 mb-4">Requirements</h4>
                    <div className="grid gap-3">
                      {t.recruitment.roles[activeRole].details.requirements.map((req: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-brand-primary/5 p-4 rounded-2xl border-2 border-ink/5 font-bold text-ink/80">
                          <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
                          {req}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs uppercase tracking-[0.2em] font-black text-ink/40 mb-4">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {t.recruitment.roles[activeRole].details.benefits.map((benefit: string, i: number) => (
                        <span key={i} className="bg-brand-accent/10 text-ink px-4 py-2 rounded-xl border-2 border-ink font-bold text-sm">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-8 bg-ink/5 border-t-4 border-ink mt-auto">
                <Button 
                  disabled={t.recruitment.roles[activeRole].isClosed}
                  className={`w-full h-16 rounded-2xl text-lg font-black transition-all border-4 border-ink ${t.recruitment.roles[activeRole].isClosed ? 'bg-ink/20 text-ink/40 cursor-not-allowed' : 'bg-ink text-white hover:bg-brand-primary hover:text-ink'}`}
                  onClick={() => {
                    setActiveRole(null);
                    window.open('https://forms.gle/jcYrRdb3GoaBLYNw7', '_blank');
                  }}
                >
                  {t.recruitment.roles[activeRole].isClosed ? t.recruitment.closedLabel : t.recruitment.cta}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const TestimonialAvatar = ({ avatar }: { avatar: string }) => {
  const [imgError, setImgError] = useState(false);
  if (!avatar || imgError) {
    return (
      <div className="w-full h-full bg-brand-primary/20 flex items-center justify-center">
        <User className="w-6 h-6 text-brand-primary" />
      </div>
    );
  }
  return (
    <img
      src={`/testimonials/${avatar}`}
      className="w-full h-full object-cover"
      alt="Student Avatar"
      onError={() => setImgError(true)}
    />
  );
};

const Testimonials = () => {
  const { t, lang } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = testimonialsData;
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = items.length;
  // Ensure we can slide even if items < itemsToShow by adjusting maxIndex
  const maxIndex = Math.max(0, totalItems - itemsToShow);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? maxIndex : prev - 1));
  };

  return (
    <section id="testimonials" className="bg-brand-secondary py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-black tracking-tighter text-ink leading-tight"
          >
            {t.testimonials.title}
          </motion.h2>
        </div>
        
        <div className="relative group/carousel max-w-5xl mx-auto">
          {/* Side Arrows - Visible on hover/desktop */}
          <div className="absolute top-1/2 -left-4 md:-left-16 -translate-y-1/2 z-20 flex md:block">
            <button 
              onClick={prev}
              className="w-10 h-10 md:w-14 md:h-14 rounded-2xl border-4 border-ink bg-white flex items-center justify-center hover:bg-brand-primary transition-all shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <ChevronLeft className="w-5 h-5 md:w-7 md:h-7 text-ink" />
            </button>
          </div>

          <div className="absolute top-1/2 -right-4 md:-right-16 -translate-y-1/2 z-20 flex md:block">
            <button 
              onClick={next}
              className="w-10 h-10 md:w-14 md:h-14 rounded-2xl border-4 border-ink bg-white flex items-center justify-center hover:bg-brand-primary transition-all shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <ChevronRight className="w-5 h-5 md:w-7 md:h-7 text-ink" />
            </button>
          </div>

          <div className="relative overflow-hidden px-2 md:px-0">
            <motion.div 
              className="flex gap-6"
              animate={{ x: `calc(-${currentIndex * (100 / itemsToShow)}% - ${currentIndex * (24 / itemsToShow)}px)` }}
              transition={{ type: "spring", damping: 28, stiffness: 100 }}
            >
              {items.map((testimonial, i) => (
                <div
                  key={i}
                  className="shrink-0"
                  style={{ width: `calc((100% - ${(itemsToShow - 1) * 24}px) / ${itemsToShow})` }}
                >
                  <Card className="p-5 h-full rounded-[24px] border-4 border-ink shadow-[5px_5px_0px_0px_rgba(45,52,54,1)] flex flex-col justify-between bg-white relative overflow-hidden group max-w-[280px] mx-auto min-h-[360px]">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary/10 rounded-bl-[60px]" />

                    <div className="mb-6 relative z-10">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, starIdx) => (
                          <div key={starIdx} className="w-3.5 h-3.5 text-brand-primary fill-current">★</div>
                        ))}
                      </div>
                      <p className="text-ink font-bold text-base md:text-lg leading-relaxed italic line-clamp-6">
                        "{testimonial.text[lang as 'en' | 'vi']}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-5 border-t-2 border-ink/5 mt-auto">
                      <div className="w-10 h-10 bg-brand-secondary rounded-xl overflow-hidden border-2 border-ink shadow-sm shrink-0 flex items-center justify-center">
                        <TestimonialAvatar avatar={testimonial.avatar} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm leading-tight text-ink truncate">{testimonial.name[lang as 'en' | 'vi']}</div>
                        <div className="text-[9px] text-brand-primary uppercase tracking-widest font-black mb-0.5 truncate">{testimonial.role[lang as 'en' | 'vi']}</div>
                        <div className="flex items-center gap-1 text-[9px] text-ink/40 font-bold truncate">
                          <MapPin className="w-2 h-2" />
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-12">
          {[...Array(maxIndex + 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-3 rounded-full border-2 border-ink transition-all duration-300 ${
                currentIndex === i ? "w-10 bg-brand-primary" : "w-3 bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  const { t } = useTranslation();
  const [activeGallery, setActiveGallery] = useState<null | number>(null);

  return (
    <section className="bg-brand-primary py-32 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 bg-ink text-white rounded-full font-black uppercase tracking-widest text-xs mb-8 border-2 border-white/20"
          >
            Proof of excellence
          </motion.div>
          <h2 className="text-4xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85] text-ink capitalize">
            {t.cta.title}
          </h2>
          <p className="text-xl md:text-2xl text-ink/70 font-bold mb-16 max-w-3xl mx-auto leading-relaxed">
            {t.cta.subtitle}
          </p>
        </div>

        {/* GIF Integration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 mb-20 relative z-10 max-w-5xl mx-auto">
          {t.gallery.items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col h-full cursor-pointer"
              onClick={() => setActiveGallery(i)}
            >
              <div className="relative aspect-video rounded-[32px] border-4 border-ink shadow-[12px_12px_0px_0px_rgba(45,52,54,1)] overflow-hidden bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <img
                  src={item.gifUrl}
                  className="w-full h-full object-cover"
                  alt={item.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors flex items-center justify-center">
                  <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
                </div>
              </div>
              
              <div className="mt-8 px-2 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                   <span className="px-3 py-1 bg-white border-2 border-ink rounded-lg font-black text-[10px] uppercase tracking-widest text-ink shadow-[2px_2px_0px_0px_rgba(45,52,54,1)]">
                     {item.type}
                   </span>
                </div>
                <h3 className="text-2xl font-black text-ink tracking-tight leading-none mb-3 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-ink/60 font-bold leading-relaxed flex-1">
                  {item.desc}
                </p>
                <div className="mt-4 flex items-center gap-2 text-ink font-black text-xs uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-4 h-4" /> {t.gallery.watchMore}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {activeGallery !== null && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveGallery(null)}
                className="absolute inset-0 bg-ink/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-5xl bg-white rounded-[48px] border-4 border-ink shadow-[20px_20px_0px_0px_rgba(45,52,54,1)] overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 md:p-12 overflow-y-auto">
                  <button 
                    onClick={() => setActiveGallery(null)}
                    className="absolute top-8 right-8 w-12 h-12 bg-ink/5 rounded-2xl flex items-center justify-center hover:bg-brand-primary transition-colors group z-10"
                  >
                    <X className="w-6 h-6 text-ink" />
                  </button>

                  <div className="mb-10">
                    <span className="px-4 py-1 bg-brand-primary text-ink rounded-full font-black text-xs uppercase tracking-widest border-2 border-ink mb-4 inline-block">
                      {t.gallery.items[activeGallery].type}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-black text-ink tracking-tighter leading-none mb-4">
                      {t.gallery.items[activeGallery].title}
                    </h3>
                    <p className="text-lg font-bold text-ink/60 max-w-2xl">
                      {t.gallery.items[activeGallery].desc}
                    </p>
                  </div>

                  <div className="grid gap-8">
                    {t.gallery.items[activeGallery].videos.map((vid: string, idx: number) => (
                      <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-ink font-black border-2 border-ink">
                            {idx + 1}
                          </div>
                          <h4 className="font-black text-ink text-xl uppercase tracking-tighter">Video Session {idx + 1}</h4>
                        </div>
                        <div className="relative aspect-video rounded-[32px] border-4 border-ink shadow-xl overflow-hidden bg-ink/5">
                          <video 
                            src={vid} 
                            className="w-full h-full object-cover" 
                            controls
                            playsInline
                            muted
                            loop
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-ink text-white border-t-4 border-ink flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary rounded-2xl border-2 border-white/20 flex items-center justify-center text-ink">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest opacity-50">Ready to learn?</div>
                      <div className="font-black text-xl tracking-tight">Interactive sessions starting weekly.</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="bg-white text-ink border-2 border-ink rounded-xl font-bold hover:bg-brand-primary transition-colors h-12 px-8"
                    onClick={() => {
                        setActiveGallery(null);
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Inquire Now
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-10 relative z-10 mt-10">
          <div className="h-2 w-24 bg-ink/20 rounded-full" />
          <div className="flex justify-center relative group">
            {/* Pulsing Aura */}
            <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
            
            <button 
              className="relative bg-ink text-white group px-8 md:px-12 py-6 rounded-[32px] border-4 border-ink shadow-[12px_12px_0px_0px_rgba(45,52,54,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex flex-col md:flex-row items-center gap-4 overflow-hidden"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:12px_12px]" />
              </div>

              <div className="relative z-10 flex items-center justify-center w-14 h-14 bg-brand-primary rounded-2xl border-2 border-ink rotate-3 group-hover:rotate-12 transition-transform">
                <Users className="w-8 h-8 text-ink" />
              </div>
              
              <div className="relative z-10 text-left">
                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary mb-1">Limited spots available</div>
                <div className="text-xl md:text-3xl font-black tracking-tighter leading-none flex items-center gap-2">
                  {t.cta.button}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </button>
            
            {/* Floating Tag */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-10 bg-brand-accent px-4 py-2 border-2 border-ink rounded-xl font-black text-xs uppercase tracking-widest shadow-lg -rotate-12 hidden md:block"
            >
              Live class info
            </motion.div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 border-[40px] border-white/10 rounded-full z-0"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 border-[60px] border-ink/5 rounded-full z-0"
        />
      </div>
    </section>
  );
};

const Contact = () => {
  const { t } = useTranslation();

  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-brand-accent text-ink rounded-[32px] md:rounded-[48px] p-6 sm:p-12 md:p-20 overflow-hidden relative border-4 border-ink shadow-[12px_12px_0px_0px_rgba(45,52,54,1)] md:shadow-[20px_20px_0px_0px_rgba(45,52,54,1)]">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 whitespace-pre-line">{t.contact.title} <br /><span className="text-brand-primary">{t.contact.accent}</span></h2>
              <p className="text-lg font-bold text-ink/70 mb-8 leading-tight">{t.contact.subtitle}</p>
              
              <div className="space-y-4">
                <a href="https://www.facebook.com/profile.php?id=100054401312922" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-ink/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                    <Facebook className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-40">Facebook</span>
                    <span className="font-bold underline decoration-brand-primary decoration-2 underline-offset-4">{t.contact.info.facebook}</span>
                  </div>
                </a>

                <a href="mailto:suzynguyenhoangdiem@gmail.com" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-ink/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                    <Mail className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-40">Email</span>
                    <span className="font-bold underline decoration-brand-primary decoration-2 underline-offset-4">suzynguyenhoangdiem@gmail.com</span>
                  </div>
                </a>

                <a href="https://join.skype.com/invite/UCNut3K6rX5X" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-ink/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                    <Globe className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-40">Skype</span>
                    <span className="font-bold underline decoration-brand-primary decoration-2 underline-offset-4">{t.contact.info.skype}</span>
                  </div>
                </a>

                <a href="http://zaloapp.com/qr/p/1t62w9cfld1fy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-ink/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                    <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-40">Zalo</span>
                    <span className="font-bold underline decoration-brand-primary decoration-2 underline-offset-4">{t.contact.info.zalo}</span>
                  </div>
                </a>

                <div className="flex items-center gap-4 pt-4 border-t border-ink/5">
                  <div className="w-12 h-12 bg-ink/10 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-40">Schedule</span>
                    <span className="font-bold">{t.contact.info.schedule}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white text-ink p-6 md:p-8 rounded-[32px] border-4 border-ink shadow-xl relative">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-primary border-4 border-ink rotate-12 flex items-center justify-center">
                <FileText className="w-8 h-8 text-ink" />
              </div>

              <h3 className="text-xl md:text-2xl mb-2 font-black tracking-tighter leading-tight uppercase underline decoration-brand-primary decoration-4">
                {t.contact.manifesto.title}
              </h3>
              
              <p className="text-xs font-black text-ink/60 mb-6 italic uppercase tracking-wider">
                {t.contact.manifesto.intro}
              </p>

              <div className="space-y-4">
                {t.contact.manifesto.points.map((point: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary border-2 border-ink flex items-center justify-center font-black text-xs group-hover:-rotate-12 transition-transform">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase leading-none mb-1.5">{point.title}</h4>
                      <p className="text-sm font-bold text-ink/70 leading-relaxed">{point.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-5 bg-brand-accent rounded-xl border-4 border-ink shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
                <p className="text-sm font-black text-center text-ink leading-snug">
                  {t.contact.manifesto.footer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const VisitorMap = () => {
  const { t } = useTranslation();
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  const studentLocations = [
    { name: "California", coords: [-119.4179, 36.7783], count: 8 },
    { name: "Dong Nai, Vietnam", coords: [107.1352, 11.0125], count: 20 },
    { name: "Ho Chi Minh City, Vietnam", coords: [106.6297, 10.8231], count: 13 },
    { name: "Binh Dinh, Vietnam", coords: [109.1232, 13.9876], count: 10 },
    { name: "Melbourne, Australia", coords: [144.9631, -37.8136], count: 5 },
    { name: "Seattle, USA", coords: [-122.3321, 47.6062], count: 2 },
    { name: "Cambridge, UK", coords: [0.1218, 52.2053], count: 1 },
    { name: "Ishikawa, Japan", coords: [136.6256, 36.5947], count: 3 },
    { name: "Beijing, China", coords: [116.4074, 39.9042], count: 1 },
  ];

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 450;
    
    // Clear previous
    svg.selectAll("*").remove();

    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Load world map data
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((data: any) => {
      const countries = (feature(data, data.objects.countries) as any).features;

      // Draw countries
      svg.append("g")
        .selectAll("path")
        .data(countries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#f3f4f6")
        .attr("stroke", "#d1d5db")
        .attr("stroke-width", 0.5);

      // Add student dots
      const dots = svg.append("g")
        .selectAll("circle")
        .data(studentLocations)
        .enter()
        .append("g")
        .attr("transform", d => {
          const [x, y] = projection(d.coords as [number, number]) || [0, 0];
          return `translate(${x}, ${y})`;
        });

      // Pulse circle
      dots.append("circle")
        .attr("r", 4)
        .attr("fill", "#ff8f00")
        .attr("fill-opacity", 0.4)
        .append("animate")
        .attr("attributeName", "r")
        .attr("values", "4;12;4")
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");

      // Core dot
      dots.append("circle")
        .attr("r", 3)
        .attr("fill", "#ff8f00")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .append("title")
        .text(d => d.name);

      // Ensure all circles have the simple location title
      dots.selectAll("circle").append("title")
        .text(d => (d as any).name);
    });
  }, []);

  return (
    <section className="py-24 bg-brand-secondary/20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">{t.global.title}</h2>
          <p className="text-xl text-ink/60 font-bold">{t.global.subtitle}</p>
        </div>
        
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-brand-primary rounded-2xl -rotate-12 z-0" />
          <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-brand-accent rounded-2xl rotate-12 z-0" />
          
          <div className="relative z-10 bg-white p-4 md:p-10 rounded-2xl border-4 border-ink shadow-[15px_15px_0px_0px_rgba(45,52,54,1)] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center min-h-[300px] md:min-h-[450px]">
              <svg 
                ref={svgRef} 
                viewBox="0 0 800 450" 
                className="w-full h-auto drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-ink text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-ink font-black text-xl">S</div>
            <span className="font-black text-2xl tracking-tighter">Suzy Ruan</span>
          </div>
          
          <div className="text-sm text-white/40 font-bold order-3 md:order-2">
            {t.footer.rights}
          </div>

          <div className="flex gap-6 order-2 md:order-3">
            <a href="https://www.facebook.com/profile.php?id=100054401312922" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-brand-primary transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://www.youtube.com/channel/UCQqQpt07_QXexJUKScE3xFw" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-brand-primary transition-colors">
              <Youtube className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AppStoreSection = () => {
  const { t, setView } = useTranslation();
  return (
    <section id="app-store" className="pb-24 pt-0 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="p-8 md:p-16 bg-brand-secondary/10 text-ink rounded-[48px] border-8 border-ink shadow-[20px_20px_0px_0px_rgba(255,204,0,1)] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-[100px] -z-0" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-[120px] -z-0" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-ink text-brand-primary font-black mb-6 px-4 py-1 text-sm border-2 border-ink">
                <Smartphone className="w-4 h-4 mr-2" />
                {t.appStore.subtitle}
              </Badge>
              <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-none text-ink">
                {t.appStore.title}
              </h2>
              <p className="text-xl text-ink/70 font-bold mb-10 leading-relaxed max-w-lg">
                {t.appStore.desc}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  className="bg-brand-primary text-ink hover:bg-ink hover:text-brand-primary rounded-2xl h-16 px-10 text-xl font-black shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] border-4 border-ink transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                  onClick={() => setView("appstore")}
                >
                  {t.appStore.cta}
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-sm mx-auto">
                {/* Stacked background layers */}
                <div className="absolute inset-2 bg-brand-primary rounded-[44px] border-4 border-ink rotate-[-4deg] shadow-[6px_6px_0px_0px_rgba(45,52,54,1)]" />
                <div className="absolute inset-2 bg-ink rounded-[44px] border-4 border-ink rotate-[2deg]" />

                {/* Main app store card */}
                <div className="relative z-10 bg-white border-4 border-ink rounded-[44px] shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] overflow-hidden">

                  {/* Header bar */}
                  <div className="bg-ink px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-brand-primary rounded-lg flex items-center justify-center border-2 border-white/20">
                        <Smartphone className="w-3.5 h-3.5 text-ink" />
                      </div>
                      <span className="font-black text-white text-sm tracking-tight">Ms. Suzy Apps</span>
                    </div>
                    <span className="bg-brand-primary text-ink font-black text-[10px] px-3 py-1 rounded-full border-2 border-brand-primary/60">
                      6 apps
                    </span>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Available apps */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-ink/30 mb-3">Available Now</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: <Rocket className="w-6 h-6" />,   bg: "bg-brand-primary",    name: "Vocabulary", sub: "681 words" },
                          { icon: <Trophy className="w-6 h-6" />,   bg: "bg-brand-secondary",  name: "Quiz",       sub: "3 modes"  },
                          { icon: <Smile className="w-6 h-6" />,    bg: "bg-brand-accent",     name: "Let's Talk", sub: "Speaking" },
                        ].map((app, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className={`w-14 h-14 ${app.bg} rounded-2xl border-2 border-ink flex items-center justify-center text-ink shadow-[3px_3px_0px_0px_rgba(45,52,54,1)]`}>
                              {app.icon}
                            </div>
                            <span className="font-black text-[10px] text-ink text-center leading-tight">{app.name}</span>
                            <span className="font-bold text-[9px] text-ink/40 text-center">{app.sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-dashed border-ink/10" />

                    {/* More apps */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: <PenTool className="w-6 h-6" />,  bg: "bg-brand-primary/40",   name: "Grammar"   },
                        { icon: <Mic className="w-6 h-6" />,      bg: "bg-brand-secondary/40", name: "Listening" },
                        { icon: <BookOpen className="w-6 h-6" />, bg: "bg-brand-accent/40",    name: "Reading"   },
                      ].map((app, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                          <div className={`w-14 h-14 ${app.bg} rounded-2xl border-2 border-ink flex items-center justify-center text-ink shadow-[3px_3px_0px_0px_rgba(45,52,54,1)]`}>
                            {app.icon}
                          </div>
                          <span className="font-black text-[10px] text-ink text-center leading-tight">{app.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating: new badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -right-10 z-20 bg-ink text-white rounded-2xl border-4 border-ink shadow-[4px_4px_0px_0px_rgba(255,204,0,1)] px-4 py-3 min-w-[108px]"
                >
                  <Sparkles className="w-4 h-4 text-brand-primary mb-1" />
                  <p className="font-black text-sm leading-tight">✨ New!</p>
                  <p className="text-[10px] font-bold text-white/40 mt-0.5">Movers Quiz</p>
                </motion.div>

                {/* Floating: student access */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute -bottom-5 -left-10 z-20 bg-brand-primary rounded-2xl border-4 border-ink shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] px-4 py-3 min-w-[120px]"
                >
                  <Users className="w-4 h-4 text-ink mb-1" />
                  <p className="font-black text-sm text-ink leading-tight">Students</p>
                  <p className="text-[10px] font-bold text-ink/50 mt-0.5">Login to access</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Rocket:       <Rocket className="w-6 h-6 text-ink" />,
  GraduationCap:<GraduationCap className="w-6 h-6 text-ink" />,
  Trophy:       <Trophy className="w-6 h-6 text-ink" />,
  Smile:        <Smile className="w-6 h-6 text-ink" />,
  BookOpen:     <BookOpen className="w-6 h-6 text-ink" />,
  Sparkles:     <Sparkles className="w-6 h-6 text-ink" />,
  FileText:     <FileText className="w-6 h-6 text-ink" />,
  Users:        <Users className="w-6 h-6 text-ink" />,
  MessageSquare:<MessageSquare className="w-6 h-6 text-ink" />,
  Globe:        <Globe className="w-6 h-6 text-ink" />,
  Mic:          <Mic className="w-6 h-6 text-ink" />,
  PenTool:      <PenTool className="w-6 h-6 text-ink" />,
  Laptop:       <Laptop className="w-6 h-6 text-ink" />,
  Calendar:     <Calendar className="w-6 h-6 text-ink" />,
  Briefcase:    <Briefcase className="w-6 h-6 text-ink" />,
  CheckSquare:  <CheckSquare className="w-6 h-6 text-ink" />,
};

const BG_MAP: Record<string, string> = {
  primary:   "bg-brand-primary",
  secondary: "bg-brand-secondary",
  accent:    "bg-brand-accent",
};

const AppStoreView = () => {
  const { t, setView, lang } = useTranslation();
  const [user, setUser] = useState<null | "admin" | "student" | "guest">(null);
  const [loggedInId, setLoggedInId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [launchedApp, setLaunchedApp] = useState<{ id: string; title: string } | null>(null);

  // Detect which trial folders exist (for guest access check)
  const globPaths = Object.keys(import.meta.glob("/public/media/*/words.csv"));
  const trialFolders = globPaths.map(p => p.split("/")[3]).filter(f => f.endsWith("_trial"));

  if (launchedApp) {
    if (launchedApp.id === "student_manager") {
      return <StudentManagerApp onBack={() => setLaunchedApp(null)} />;
    }
    if (launchedApp.id === "movers_quiz") {
      return <MoversQuizApp onBack={() => setLaunchedApp(null)} />;
    }
    if (launchedApp.id === "movers_talk") {
      return <MoversLetsTalkApp onBack={() => setLaunchedApp(null)} />;
    }
    if (launchedApp.id === "kanji") {
      return <KanjiApp onBack={() => setLaunchedApp(null)} />;
    }
    if (launchedApp.id === "kanji_quiz") {
      return <KanjiQuizApp onBack={() => setLaunchedApp(null)} />;
    }
    if (launchedApp.id === "everyday_activities") {
      return <EverydayActivitiesApp onBack={() => setLaunchedApp(null)} />;
    }
    if (launchedApp.id === "practice_quiz") {
      return <PracticeQuizApp onBack={() => setLaunchedApp(null)} lang={lang} />;
    }
    return <VocabularyApp
      appId={launchedApp.id}
      title={launchedApp.title}
      isTrial={user === "guest"}
      onBack={() => setLaunchedApp(null)}
    />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      setUser("admin");
      setLoggedInId(username);
      setError("");
      return;
    }
    const hash = await sha256(password);
    const student = studentsData.students.find(s => s.id === username && s.hash === hash);
    if (student) {
      setUser("student");
      setLoggedInId(username);
      setError("");
    } else {
      setError(t.appStore.loginError);
    }
  };

  const handleGuest = () => {
    setUser("guest");
  };

  const visibleApps = appsConfig.filter(app => {
    if (user === "admin") return true;
    if (user === "student") return app.access === "all" || app.access === "student";
    if (user === "guest") return app.access === "all" && trialFolders.includes(`${app.id}_trial`);
    return false;
  });

  return (
    <div className="min-h-screen bg-brand-secondary/10 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-8 border-4 border-ink font-black rounded-xl hover:bg-brand-primary transition-all"
          onClick={() => setView("home")}
        >
          <ChevronLeft className="mr-2 w-4 h-4" />
          {t.appStore.backToHome}
        </Button>

        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 md:p-12 rounded-[40px] border-4 border-ink shadow-[12px_12px_0px_0px_rgba(45,52,54,1)]"
            >
              <div className="text-center mb-10">
                <Smartphone className="w-16 h-16 text-brand-primary mx-auto mb-4" />
                <h2 className="text-4xl font-black tracking-tighter">{t.appStore.loginTitle}</h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-black uppercase mb-2 ml-1">{t.appStore.username}</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Student ID"
                    className="w-full h-14 bg-ink/5 border-4 border-ink rounded-2xl px-6 font-bold outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black uppercase mb-2 ml-1">{t.appStore.password}</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 bg-ink/5 border-4 border-ink rounded-2xl px-6 font-bold outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                {error && <p className="text-red-500 font-extrabold text-sm ml-1">{error}</p>}
                
                <Button 
                  type="submit"
                  className="w-full h-16 bg-ink text-white rounded-2xl font-black text-xl hover:bg-brand-primary hover:text-ink border-4 border-ink transition-all"
                >
                  {t.appStore.loginBtn}
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t-2 border-ink/5 flex flex-col items-center">
                <p className="text-ink/40 font-bold mb-4">OR</p>
                <Button 
                  variant="outline"
                  className="w-full h-14 border-4 border-ink rounded-2xl font-black hover:bg-brand-accent transition-all"
                  onClick={handleGuest}
                >
                  {t.appStore.continueGuest}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="apps"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-brand-primary text-ink font-black mb-2">
                    {user === "admin" ? "Admin Access" : user === "student" ? `Student: ${loggedInId}` : t.appStore.guestTrial}
                  </Badge>
                  <h2 className="text-4xl font-black tracking-tighter">{t.appStore.appsLabel}</h2>
                </div>
                <Button 
                  variant="ghost" 
                  className="font-black text-ink/60 hover:text-ink"
                  onClick={() => { setUser(null); setLoggedInId(""); }}
                >
                  Logout
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {visibleApps.map((app) => (
                  <motion.div
                    key={app.id}
                    layoutId={`app-${app.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-3xl border-4 border-ink shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
                    onClick={() => setLaunchedApp({ id: app.id, title: app.name })}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border-2 border-ink ${BG_MAP[app.bg] ?? "bg-brand-accent"}`}>
                      {ICON_MAP[app.icon] ?? <BookOpen className="w-6 h-6 text-ink" />}
                    </div>
                    <h3 className="text-xl font-black mb-2">{app.name}</h3>
                    <p className="text-sm text-ink/60 font-bold leading-relaxed">{app.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [lang, setLang] = useState<Language>("en");
  const [view, setView] = useState<"home" | "appstore">("home");
  const t = translations[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, view, setView }}>
      <div className="min-h-screen overflow-x-hidden relative">
        {view === "home" && <Navbar />}
        {view === "home" ? (
          <>
            <Hero />
            <Features />
            <AppStoreSection />
            <Programs />
            <StudentRequirements />
            <Testimonials />
            <CTA />
            <Contact />
            <VisitorMap />
            <CareerRecruitment />
            <Footer />
          </>
        ) : (
          <AppStoreView />
        )}
      </div>
    </LanguageContext.Provider>
  );
}
