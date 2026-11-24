"use client";

import { Download } from "lucide-react";

export function AdminExportControls() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href="/api/exports/admin/exports/impact?format=pdf"
        download
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Impact (PDF)</span>
      </a>
      <a
        href="/api/exports/admin/exports/impact?format=xlsx"
        download
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-border text-foreground hover:bg-slate-50 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Impact (Excel)</span>
      </a>
      <a
        href="/api/exports/admin/exports/impact?format=csv"
        download
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-border text-foreground hover:bg-slate-50 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Impact (CSV)</span>
      </a>
      <a
        href="/api/exports/admin/exports/users?format=csv"
        download
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-secondary/30 text-secondary hover:bg-secondary/5 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Utilisateurs (CSV)</span>
      </a>
      <a
        href="/api/exports/admin/exports/users?format=xlsx"
        download
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-secondary/30 text-secondary hover:bg-secondary/5 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Utilisateurs (Excel)</span>
      </a>
    </div>
  );
}
