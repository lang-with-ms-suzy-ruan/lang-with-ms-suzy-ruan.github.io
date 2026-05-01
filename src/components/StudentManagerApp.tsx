import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Trash2, Download, Users } from "lucide-react";
import initialData from "../data/students.json";

interface Student {
  id: string;
  hash: string;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Props {
  onBack: () => void;
}

export function StudentManagerApp({ onBack }: Props) {
  const [students, setStudents] = useState<Student[]>(initialData.students);
  const [newId, setNewId] = useState("");
  const [newPass, setNewPass] = useState("");
  const [notice, setNotice] = useState<{ msg: string; ok: boolean } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = newId.trim();
    const pass = newPass.trim();
    if (!id || !pass) {
      setNotice({ msg: "Student ID and password are required.", ok: false });
      return;
    }
    if (students.find(s => s.id === id)) {
      setNotice({ msg: `"${id}" already exists.`, ok: false });
      return;
    }
    const hash = await sha256(pass);
    setStudents(prev => [...prev, { id, hash }]);
    setNewId("");
    setNewPass("");
    setNotice({ msg: `Added "${id}". Download to save.`, ok: true });
  };

  const handleDelete = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setNotice({ msg: `Deleted "${id}". Download to save.`, ok: true });
  };

  const handleDownload = () => {
    const json = JSON.stringify({ students }, null, 2) + "\n";
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-ink pt-8 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <Button
          variant="ghost"
          className="mb-8 font-black text-white/70 hover:text-white hover:bg-white/10"
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 w-4 h-4" />
          Back
        </Button>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Student Manager</h1>
            <p className="text-white/50 font-bold text-sm">Add and remove student accounts</p>
          </div>
        </div>

        {/* Add student */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5">
          <h2 className="text-white font-black mb-4 uppercase text-xs tracking-widest opacity-60">Add Student</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              type="text"
              value={newId}
              onChange={e => setNewId(e.target.value)}
              placeholder="Student ID"
              className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 font-bold text-white placeholder:text-white/30 outline-none focus:border-brand-primary transition-colors"
            />
            <input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 font-bold text-white placeholder:text-white/30 outline-none focus:border-brand-primary transition-colors"
            />
            {notice && (
              <p className={`font-bold text-sm ${notice.ok ? "text-green-400" : "text-red-400"}`}>
                {notice.msg}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11 bg-brand-primary text-ink font-black rounded-xl hover:bg-brand-accent transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </form>
        </div>

        {/* Student list */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5">
          <h2 className="text-white font-black mb-4 uppercase text-xs tracking-widest opacity-60">
            Students ({students.length})
          </h2>
          {students.length === 0 ? (
            <p className="text-white/40 font-bold text-sm">No students yet.</p>
          ) : (
            <ul className="space-y-2">
              {students.map(s => (
                <li
                  key={s.id}
                  className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
                >
                  <span className="text-white font-black">{s.id}</span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Download */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-white font-black mb-2 uppercase text-xs tracking-widest opacity-60">Save Changes</h2>
          <p className="text-white/50 text-sm font-bold mb-4">
            Download the file, replace <code className="text-brand-primary font-mono">src/data/students.json</code> in the project, then commit and push to deploy.
          </p>
          <Button
            onClick={handleDownload}
            className="w-full h-11 bg-white text-ink font-black rounded-xl hover:bg-brand-primary transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Download students.json
          </Button>
        </div>
      </div>
    </div>
  );
}
