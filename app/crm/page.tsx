"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: number;
  name: string;
  business: string;
  website: string;
  email: string;
  phone: string | null;
  businessType: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type LeadNote = {
  id: number;
  leadId: number;
  note: string;
  createdBy: string;
  createdAt: string;
};

const statuses = ["all", "new", "contacted", "qualified", "proposal", "won", "lost"] as const;

export default function CRMPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState("admin");
  const [userRole, setUserRole] = useState<"admin" | "manager" | "sales" | null>(null);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, LeadNote[]>>({});
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchSession = async () => {
    try {
      const response = await fetch("/api/admin/session");
      if (response.ok) {
        const data = await response.json();
        setAuthenticated(true);
        setUserRole(data.role ?? "admin");
      } else {
        setAuthenticated(false);
        setUserRole(null);
      }
    } catch {
      setAuthenticated(false);
      setUserRole(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchLeads = async (nextStatus = statusFilter, nextSearch = searchTerm) => {
    try {
      const params = new URLSearchParams();
      if (nextStatus && nextStatus !== "all") {
        params.set("status", nextStatus);
      }
      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      }

      const response = await fetch(`/api/leads?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load leads.");
      }

      setLeads(data.leads || []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSession();
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    void fetchLeads(statusFilter, searchTerm);
  }, [authenticated, statusFilter, searchTerm]);

  const fetchLeadNotes = async (leadId: number) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/notes`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load notes.");
      }

      setNotes((current) => ({ ...current, [leadId]: data.notes || [] }));
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : "Could not load notes.");
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid login.");
      }

      setAuthenticated(true);
      setUserRole(data.role ?? "admin");
      setPassword("");
      setLoading(true);
      await fetchLeads();
    } catch (loginError) {
      setAuthError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setUserRole(null);
    setSelectedLeadId(null);
    setNotes({});
    setError(null);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Could not update lead status.");
      }

      await fetchLeads();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update lead status.");
    }
  };

  const handleAddNote = async () => {
    if (!selectedLeadId || !newNote.trim()) {
      return;
    }

    setSavingNote(true);

    try {
      const response = await fetch(`/api/leads/${selectedLeadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save note.");
      }

      setNewNote("");
      await fetchLeadNotes(selectedLeadId);
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : "Could not save note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "all") {
      params.set("status", statusFilter);
    }
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    const response = await fetch(`/api/leads/export?${params.toString()}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Export failed.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dmk-leads.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const visibleLeadCount = useMemo(() => leads.length, [leads.length]);

  if (checkingAuth) {
    return <main className="container py-16 text-center text-slate-600">Loading CRM...</main>;
  }

  if (!authenticated) {
    return (
      <main className="container flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#1769e0]">Admin access</div>
          <h1 className="mt-3 text-3xl font-black text-[#0b1736]">CRM login</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to review leads, update the pipeline, and take follow-up notes.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1769e0]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1769e0]"
              />
            </label>

            {authError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{authError}</div>}

            <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center">
              {authLoading ? "Signing in..." : "Sign in to CRM"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-16">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#1769e0]">CRM</div>
          <h1 className="mt-2 text-4xl font-black text-[#0b1736]">Lead Pipeline</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[#eff7ff] px-4 py-2 text-sm font-bold text-[#1769e0] uppercase">
            {userRole ?? "admin"}
          </div>
          <div className="rounded-full bg-[#eff7ff] px-4 py-2 text-sm font-bold text-[#1769e0]">
            {visibleLeadCount} lead{visibleLeadCount === 1 ? "" : "s"}
          </div>
          <button
            onClick={async () => {
              try {
                await handleExport();
              } catch (exportError) {
                setError(exportError instanceof Error ? exportError.message : "Export failed.");
              }
            }}
            className="rounded-full bg-[#0b1736] px-4 py-2 text-sm font-bold text-white"
          >
            Export CSV
          </button>
          <button
            onClick={() => void handleLogout()}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Log out
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search leads by name, business, email, or website..."
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1769e0]"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1769e0]"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>{status === "all" ? "All statuses" : status}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Business</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">Website</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No matching leads found.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#0b1736]">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.businessType || "General"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{lead.business}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <a href={`mailto:${lead.email}`} className="text-[#1769e0] underline">{lead.email}</a>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <a href={lead.website} target="_blank" rel="noreferrer" className="text-[#1769e0] underline">{lead.website}</a>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(event) => void handleStatusChange(lead.id, event.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"
                      >
                        {statuses.filter((status) => status !== "all").map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700"
                          onClick={async () => {
                            setSelectedLeadId(lead.id);
                            await fetchLeadNotes(lead.id);
                          }}
                        >
                          Notes
                        </button>
                        <Link href={`/crm/${lead.id}`} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeadId && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-[#0b1736]">Follow-up notes</h2>
            <button onClick={() => setSelectedLeadId(null)} className="text-sm font-semibold text-[#1769e0]">
              Close
            </button>
          </div>

          <div className="space-y-3">
            {(notes[selectedLeadId] || []).length === 0 ? (
              <p className="text-sm text-slate-500">No notes yet for this lead.</p>
            ) : (
              (notes[selectedLeadId] || []).map((note) => (
                <div key={note.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                    {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{note.note}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 space-y-3">
            <textarea
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder="Add a follow-up note..."
              className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1769e0]"
            />
            <button
              onClick={() => void handleAddNote()}
              disabled={savingNote}
              className="btn-primary"
            >
              {savingNote ? "Saving..." : "Save note"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
