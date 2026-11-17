"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Globe, Trash2, X, Loader2, Pencil, ArrowUpRight, Info } from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { getApiUrl } from "@/lib/api-config";

interface ProjectItem {
  id: string;
  name: string;
  target_domain?: string;
  brand_voice_instructions?: string;
  default_language: string;
  created_at?: string;
}

export default function ProjectsPage() {
  const tk = useTokens();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newBrandVoice, setNewBrandVoice] = useState("");
  const [newLanguage, setNewLanguage] = useState("id");

  const openCreateModal = () => {
    setEditingProject(null);
    setNewProjectName("");
    setNewDomain("");
    setNewBrandVoice("");
    setNewLanguage("id");
    setShowModal(true);
  };

  const openEditModal = (proj: ProjectItem) => {
    setEditingProject(proj);
    setNewProjectName(proj.name || "");
    setNewDomain(proj.target_domain || "");
    setNewBrandVoice(proj.brand_voice_instructions || "");
    setNewLanguage(proj.default_language || "id");
    setShowModal(true);
  };

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      const res = await fetch(getApiUrl("/api/v1/projects"));
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } else {
        setProjects([]);
      }
    } catch (e) {
      setProjects([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsSubmitting(true);
    try {
      const endpoint = editingProject
        ? getApiUrl(`/api/v1/projects/${editingProject.id}`)
        : getApiUrl("/api/v1/projects");
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          target_domain: editingProject ? newDomain.trim() : (newDomain.trim() || undefined),
          brand_voice_instructions: editingProject
            ? newBrandVoice.trim()
            : (newBrandVoice.trim() || undefined),
          default_language: newLanguage,
        }),
      });

      if (res.ok) {
        await fetchProjects();
        setEditingProject(null);
        setNewProjectName("");
        setNewDomain("");
        setNewBrandVoice("");
        setNewLanguage("id");
        setShowModal(false);
      }
    } catch (e) {
      console.error("Save project error:", e);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/v1/projects/${id}`), {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error("Delete project error:", e);
    }
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
          onClick={openCreateModal}
          className="t-accent-bg flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 w-fit cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Tambah Proyek Baru</span>
        </button>
      </div>

      {/* Penjelasan Fungsi Proyek & Brand Voice */}
      <div className={`p-3.5 rounded-xl border t-border t-bg-tag flex items-start gap-3 text-xs`}>
        <Info className={`w-4 h-4 shrink-0 mt-0.5 ${tk.accentText}`} />
        <p className={`${tk.textMuted} leading-relaxed`}>
          <strong className={tk.textPrimary}>Cara Kerja Proyek & Brand Voice:</strong> Simpan preset domain target, bahasa default, dan aturan gaya penulisan editorial untuk masing-masing website Anda. Saat memilih proyek di halaman <strong className={tk.textPrimary}>Generator</strong>, instruksi Brand Voice otomatis diterapkan ke pembuatan Outline dan Section Writer AI.
        </p>
      </div>

      {/* Projects Grid / Empty State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Loader2 className={`w-5 h-5 animate-spin ${tk.accentText}`} />
          <span className={`text-xs ${tk.textMuted}`}>Memuat daftar proyek...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 px-4 text-center space-y-3 t-card rounded-2xl border t-border">
          <div className={`w-12 h-12 rounded-xl t-bg-tag border t-border flex items-center justify-center mx-auto text-stone-400`}>
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${tk.textPrimary}`}>Belum Ada Proyek</h3>
            <p className={`text-xs ${tk.textMuted} mt-1 max-w-sm mx-auto`}>
              Tambahkan website atau proyek pertama Anda untuk menyimpan konfigurasi Brand Voice & Domain khusus.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="t-accent-bg inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 mt-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Tambah Proyek Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`t-card rounded-xl p-5 space-y-4 shadow-sm transition-all border t-border`}
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
                      <span>{proj.target_domain || "Tanpa domain"}</span>
                      <span>• {proj.default_language?.toUpperCase() || "ID"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/generator?project_id=${proj.id}`}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors ${tk.outlineBtn}`}
                    title="Gunakan Proyek Ini di Generator"
                  >
                    <span>Pakai</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEditModal(proj)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-[#d97757] hover:bg-[#d97757]/10 transition-colors cursor-pointer"
                    title="Edit Proyek"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Hapus Proyek"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-xs space-y-1 ${tk.tagBg}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider block ${tk.textFaint}`}>
                  Instruksi Brand Voice:
                </span>
                <p className={`${tk.textMuted} leading-relaxed`}>
                  {proj.brand_voice_instructions || "Default: Authoritative & Actionable tanpa kata klise AI."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Proyek */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isSubmitting && setShowModal(false)}
          />
          <div
            className={`relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 ${tk.cardBg}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className={`w-4 h-4 ${tk.accentText}`} />
                <h2 className={`text-sm font-semibold ${tk.textPrimary}`}>
                  {editingProject ? "Edit Proyek & Brand Voice" : "Tambah Proyek Baru"}
                </h2>
              </div>
              <button
                disabled={isSubmitting}
                onClick={() => setShowModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${tk.navInactive}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className={`text-[11px] font-semibold uppercase tracking-wider ${tk.textFaint}`}>
                  Nama Proyek / Website <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="contoh: Portal Berita Teknologi"
                  className="w-full t-input border rounded-lg p-2.5 t-border-focus transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-semibold uppercase tracking-wider ${tk.textFaint}`}>
                  Target Domain
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="contoh: portalteknologi.id"
                  className="w-full t-input border rounded-lg p-2.5 t-border-focus transition-colors font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-semibold uppercase tracking-wider ${tk.textFaint}`}>
                  Instruksi Brand Voice
                </label>
                <textarea
                  rows={3}
                  value={newBrandVoice}
                  onChange={(e) => setNewBrandVoice(e.target.value)}
                  placeholder="contoh: Nada bicara kasual tapi berbobot, berikan contoh kasus nyata di Indonesia..."
                  className="w-full t-input border rounded-lg p-2.5 t-border-focus resize-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-semibold uppercase tracking-wider ${tk.textFaint}`}>
                  Bahasa Default
                </label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full t-input border rounded-lg p-2.5 t-border-focus transition-colors cursor-pointer"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English (US)</option>
                  <option value="ms">Bahasa Melayu</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t t-border">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${tk.outlineBtn}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newProjectName.trim()}
                  className="t-accent-bg px-4 py-2 rounded-lg font-semibold shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingProject ? "Simpan Perubahan" : "Simpan Proyek"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
