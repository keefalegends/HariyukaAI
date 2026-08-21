"use client";

import { useState } from "react";
import { FolderKanban, Plus, Globe, Trash2, X } from "lucide-react";
import { useTokens } from "@/lib/use-tokens";

export default function ProjectsPage() {
  const tk = useTokens();
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
          <h1 className={`text-base font-semibold ${tk.textPrimary}`}>Proyek & Brand Voice</h1>
          <p className={`text-xs ${tk.textMuted} mt-0.5`}>
            Atur instruksi gaya bahasa khusus (Brand Voice) dan target domain untuk setiap website Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="t-accent-bg flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors w-fit cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Tambah Proyek Baru</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className={`t-card rounded-xl p-5 space-y-4 shadow-sm transition-all`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg t-bg-tag border t-border flex items-center justify-center text-stone-400`}>
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${tk.textPrimary}`}>{proj.name}</h3>
                  <div className={`flex items-center gap-1.5 text-xs ${tk.textMuted} mt-0.5`}>
                    <Globe className="w-3 h-3" />
                    <span>{proj.target_domain}</span>
                    <span>• {proj.default_language.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(proj.id)}
                className={`p-1.5 rounded-lg text-stone-500 hover:text-red-400 transition-colors cursor-pointer`}
                title="Hapus proyek"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={`t-bg-tag border t-border rounded-lg p-3 text-xs space-y-1`}>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${tk.textFaint}`}>
                Instruksi Brand Voice:
              </span>
              <p className={`text-[11px] ${tk.textSecondary} leading-relaxed`}>
                {proj.brand_voice_instructions}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className={`relative z-10 w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 ${tk.cardBg}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-semibold ${tk.textPrimary}`}>Tambah Proyek Baru</h2>
              <button onClick={() => setShowModal(false)} className={`p-1.5 rounded-lg transition-colors ${tk.navInactive}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className={`block font-semibold uppercase tracking-wider ${tk.textFaint}`}>Nama Proyek / Web</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Contoh: Blog Finansial Pintar"
                  className={`w-full t-input border rounded-lg px-3 py-2 text-xs t-border-focus`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`block font-semibold uppercase tracking-wider ${tk.textFaint}`}>Target Domain</label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="domain.com"
                    className={`w-full t-input border rounded-lg px-3 py-2 text-xs t-border-focus`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block font-semibold uppercase tracking-wider ${tk.textFaint}`}>Bahasa Default</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className={`w-full t-input border rounded-lg px-3 py-2 text-xs t-border-focus appearance-none cursor-pointer`}
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                    <option value="ms">Melayu</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`block font-semibold uppercase tracking-wider ${tk.textFaint}`}>Instruksi Brand Voice</label>
                <textarea
                  rows={3}
                  value={newBrandVoice}
                  onChange={(e) => setNewBrandVoice(e.target.value)}
                  placeholder="Instruksi gaya penulisan khusus untuk artikel proyek ini..."
                  className={`w-full t-input border rounded-lg p-3 text-xs t-border-focus resize-none`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t t-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${tk.outlineBtn}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`t-accent-bg px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
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
