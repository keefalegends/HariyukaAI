"use client";

import { useState, useEffect } from "react";
import { FolderKanban, Plus, Globe, Sparkles, Trash2, Edit2, ShieldCheck, Check } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([
    {
      id: "proj-default",
      name: "Hariyuka AI Tech Blog",
      target_domain: "hariyuka.ai",
      brand_voice_instructions: "Tone: Authoritative, modern, actionable. Hindari istilah klise seperti 'In today's fast-paced world'. Berikan contoh nyata implementasi kode dan tools lokal.",
      default_language: "id",
    },
    {
      id: "proj-ecommerce",
      name: "E-Commerce Gadget Store",
      target_domain: "tokogadget.co.id",
      brand_voice_instructions: "Tone: Persuasif, antusias, berorientasi pada value/manfaat produk untuk pembaca Indonesia.",
      default_language: "id",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newBrandVoice, setNewBrandVoice] = useState("");
  const [newLanguage, setNewLanguage] = useState("id");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      target_domain: newDomain.trim() || "domain.com",
      brand_voice_instructions: newBrandVoice.trim() || "Authoritative & Actionable",
      default_language: newLanguage,
    };

    setProjects([...projects, newProj]);
    setNewProjectName("");
    setNewDomain("");
    setNewBrandVoice("");
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Proyek & Brand Voice</h1>
          <p className="text-xs text-slate-400">
            Atur instruksi gaya bahasa khusus (Brand Voice) dan target domain untuk setiap website Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Proyek Baru</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{proj.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>{proj.target_domain}</span>
                    <span>• {proj.default_language.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(proj.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Hapus proyek"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Brand Voice Instructions
              </div>
              <p className="text-slate-300 leading-relaxed italic">
                "{proj.brand_voice_instructions}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Buat Proyek & Brand Voice Baru</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Nama Proyek
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Contoh: Blog Finansial Pintar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Target Domain
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="Contoh: finansialpintar.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Panduan Brand Voice (Instruksi Khusus Penulisan)
                </label>
                <textarea
                  rows={3}
                  value={newBrandVoice}
                  onChange={(e) => setNewBrandVoice(e.target.value)}
                  placeholder="Jelaskan karakteristik tulisan, istilah yang disukai, dan gaya bahasa unik brand Anda..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition-colors"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
