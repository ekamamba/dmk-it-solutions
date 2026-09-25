"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

type Reminder = {
  id: number;
  leadId: number;
  scheduledFor: string;
  message: string;
  status: "pending" | "completed" | "cancelled";
  createdBy: string;
  createdAt: string;
};

type EmailLog = {
  id: number;
  leadId: number;
  subject: string;
  body: string;
  sentAt: string;
  status: "draft" | "sent" | "failed";
  createdBy: string;
};

const statuses = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = Number(params.id ?? "0");

  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderDate, setReminderDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "manager" | "sales">("admin");
  const [error, setError] = useState<string | null>(null);

  const loadSession = async () => {
    try {
      const response = await fetch("/api/admin/session");
      if (!response.ok) {
        router.push("/crm");
        return;
      }

      const data = await response.json();
      setUserRole(data.role ?? "admin");
    } catch {
      router.push("/crm");
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadData = async () => {
    if (!leadId) {
      return;
    }

    try {
      const [leadResponse, notesResponse, remindersResponse, emailsResponse] = await Promise.all([
        fetch(`/api/leads/${leadId}`),
        fetch(`/api/leads/${leadId}/notes`),
        fetch(`/api/leads/${leadId}/reminders`),
        fetch(`/api/leads/${leadId}/emails`),
      ]);

      const leadData = await leadResponse.json();
      if (!leadResponse.ok) {
        throw new Error(leadData.error || "Could not load lead details.");
      }

      const notesData = await notesResponse.json();
      const remindersData = await remindersResponse.json();
      const emailData = await emailsResponse.json();

      setLead(leadData.lead ?? null);
      setNotes(notesData.notes || []);
      setReminders(remindersData.reminders || []);
      setEmailLogs(emailData.emails || []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load lead details.");
    }
  };

  useEffect(() => {
    void loadSession();
  }, [router]);

  useEffect(() => {
    if (leadId && checkingAuth === false) {
      void loadData();
    }
  }, [leadId, checkingAuth]);

  const handleStatusChange = async (status: string) => {
    if (!lead) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not update status.");
      }

      setLead((current) => (current ? { ...current, status } : current));
      setError(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update status.");
    }
  };

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) {
      return;
    }

    setSavingNote(true);

    try {
      const response = await fetch(`/api/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not save note.");
      }

      setNewNote("");
      const notesResponse = await fetch(`/api/leads/${lead.id}/notes`);
      const notesData = await notesResponse.json();
      setNotes(notesData.notes || []);
      setError(null);
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : "Could not save note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddReminder = async () => {
    if (!lead || !reminderMessage.trim() || !reminderDate) {
      return;
    }

    setSavingReminder(true);

    try {
      const response = await fetch(`/api/leads/${lead.id}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reminderMessage.trim(), scheduledFor: reminderDate }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not save reminder.");
      }

      setReminderMessage("");
      const remindersResponse = await fetch(`/api/leads/${lead.id}/reminders`);
      const remindersData = await remindersResponse.json();
      setReminders(remindersData.reminders || []);
      setError(null);
    } catch (reminderError) {
      setError(reminderError instanceof Error ? reminderError.message : "Could not save reminder.");
    } finally {
      setSavingReminder(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!lead || !emailSubject.trim() || !emailBody.trim()) {
      return;
    }

    setSavingEmail(true);

    try {
      const response = await fetch(`/api/leads/${lead.id}/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject.trim(), body: emailBody.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not log email.");
      }

      setEmailSubject("");
      setEmailBody("");
      const emailResponse = await fetch(`/api/leads/${lead.id}/emails`);
      const emailData = await emailResponse.json();
      setEmailLogs(emailData.emails || []);
      setError(null);
    } catch (emailError) {
      setError(emailError instanceof Error ? emailError.message : "Could not log email.");
    } finally {
      setSavingEmail(false);
    }
  };

  if (checkingAuth || !lead) {
    return <main className="container py-16 text-center text-slate-600">Loading lead details...</main>;
  }

  return (
    <main className="container py-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/crm" className="text-sm font-bold text-[#1769e0]">← Back to CRM</Link>
        <div className="rounded-full bg-[#eff7ff] px-4 py-2 text-sm font-bold uppercase text-[#1769e0]">{userRole}</div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#1769e0]">Lead detail</div>
            <h1 className="mt-2 text-3xl font-black text-[#0b1736]">{lead.name}</h1>
          </div>
          <select
            value={lead.status}
            onChange={(event) => void handleStatusChange(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-slate-500">Business</div>
            <div className="text-lg font-bold text-[#0b1736]">{lead.business}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-slate-500">Source</div>
            <div className="text-lg font-bold text-[#0b1736]">{lead.businessType || "General inquiry"}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-slate-500">Email</div>
            <a href={`mailto:${lead.email}`} className="text-lg font-bold text-[#1769e0] underline">{lead.email}</a>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-slate-500">Phone</div>
            <div className="text-lg font-bold text-[#0b1736]">{lead.phone || "Not provided"}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
            <div className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-slate-500">Website</div>
            <a href={lead.website} target="_blank" rel="noreferrer" className="text-lg font-bold text-[#1769e0] underline break-all">{lead.website}</a>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black text-[#0b1736]">Notes</h2>
          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-sm text-slate-500">No notes yet.</p>
            ) : (
              notes.map((note) => (
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
            <button onClick={() => void handleAddNote()} disabled={savingNote} className="btn-primary w-full justify-center">
              {savingNote ? "Saving note..." : "Save note"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black text-[#0b1736]">Reminders</h2>
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <p className="text-sm text-slate-500">No reminders scheduled.</p>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                    {reminder.status} • {new Date(reminder.scheduledFor).toLocaleString()}
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{reminder.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 space-y-3">
            <input
              type="datetime-local"
              value={reminderDate}
              onChange={(event) => setReminderDate(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1769e0]"
            />
            <textarea
              value={reminderMessage}
              onChange={(event) => setReminderMessage(event.target.value)}
              placeholder="Describe the follow-up reminder..."
              className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1769e0]"
            />
            <button onClick={() => void handleAddReminder()} disabled={savingReminder} className="btn-primary w-full justify-center">
              {savingReminder ? "Scheduling..." : "Schedule reminder"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black text-[#0b1736]">Email tracking</h2>
          <div className="space-y-3">
            {emailLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No email activity logged.</p>
            ) : (
              emailLogs.map((email) => (
                <div key={email.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="mb-1 text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                    {email.status} • {new Date(email.sentAt).toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-[#0b1736]">{email.subject}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{email.body}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 space-y-3">
            <input
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
              placeholder="Email subject"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1769e0]"
            />
            <textarea
              value={emailBody}
              onChange={(event) => setEmailBody(event.target.value)}
              placeholder="Email body..."
              className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1769e0]"
            />
            <button onClick={() => void handleSaveEmail()} disabled={savingEmail} className="btn-primary w-full justify-center">
              {savingEmail ? "Logging email..." : "Log follow-up email"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
