"use client";

import { Layers, ShoppingBag, FileText, User } from "lucide-react";

const ARTICLE_TYPE_META: Record<
  string,
  { label: string; badgeClass: string; Icon: typeof FileText }
> = {
  pillar: {
    label: "Artikel Utama",
    badgeClass:
      "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-300",
    Icon: Layers,
  },
  backlink_product: {
    label: "Backlink Produk",
    badgeClass:
      "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-300",
    Icon: ShoppingBag,
  },
  backlink_article: {
    label: "Backlink Artikel",
    badgeClass:
      "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
    Icon: FileText,
  },
};

export function resolveArticleAuthor(createdBy?: string | null, userId?: string | null): string {
  const raw = (createdBy || userId || "").trim();
  if (!raw || raw === "default-user") {
    return "default-user";
  }
  return raw;
}

interface ArticleMetaBadgesProps {
  articleType?: string | null;
  createdBy?: string | null;
  userId?: string | null;
}

export function ArticleMetaBadges({
  articleType,
  createdBy,
  userId,
}: ArticleMetaBadgesProps) {
  const typeConfig =
    ARTICLE_TYPE_META[articleType || "backlink_article"] || ARTICLE_TYPE_META.backlink_article;
  const TypeIcon = typeConfig.Icon;

  const author = resolveArticleAuthor(createdBy, userId);
  const isDefaultAuthor = author === "default-user";

  return (
    <>
      <span
        className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold inline-flex items-center gap-1 ${typeConfig.badgeClass}`}
        title={`Tipe Artikel: ${typeConfig.label}`}
      >
        <TypeIcon className="w-3 h-3" />
        <span>{typeConfig.label}</span>
      </span>

      <span
        className={`px-2 py-0.5 rounded-md border text-[11px] font-mono inline-flex items-center gap-1 ${
          isDefaultAuthor
            ? "t-border t-bg-tag text-[var(--text-muted)]"
            : "bg-[#d97757]/10 border-[#d97757]/30 text-[#d97757] font-semibold"
        }`}
        title={`Dibuat oleh akun: ${author}`}
      >
        <User className="w-3 h-3" />
        <span>@{author}</span>
      </span>
    </>
  );
}
