"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Pencil, Send, ThumbsDown, ThumbsUp, Coins } from "lucide-react";

type RequestStatus = "in-review" | "approved" | "rejected" | "published";

interface PortalRequest {
  id: number;
  title: string;
  kind: string;
  status: RequestStatus;
}

interface HistoryEntry {
  id: number;
  text: string;
  time: string;
}

const STATUS_META: Record<RequestStatus, { label: string; className: string }> = {
  "in-review": { label: "In review", className: "bg-white/10 text-mist-300" },
  approved: { label: "Approved", className: "bg-[#20b8a4]/15 text-[#7fe4d6]" },
  rejected: { label: "Rejected", className: "bg-[#f96a4d]/15 text-[#ff8b73]" },
  published: { label: "Published", className: "bg-[#8b5cf6]/20 text-[#c4b5fd]" },
};

const REQUEST_IDEAS = [
  { title: "Reel — new seasonal menu", kind: "Reel" },
  { title: "Story — behind the counter", kind: "Story" },
  { title: "Post — customer spotlight", kind: "Post" },
  { title: "Carousel — before & after", kind: "Carousel" },
];

const INITIAL_REQUESTS: PortalRequest[] = [
  { id: 1, title: "Post — weekend brunch launch", kind: "Post", status: "published" },
  { id: 2, title: "Reel — latte art in 15 seconds", kind: "Reel", status: "approved" },
];

/**
 * A working slice of the Xability customer portal: submit a content
 * request, approve / reject / edit it, publish it, and watch history and
 * credits update. All local state — but the exact flow clients use.
 */
export function PortalSimulator({ accent }: { accent: string }) {
  const [requests, setRequests] = useState<PortalRequest[]>(INITIAL_REQUESTS);
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 1, text: "“Post — weekend brunch launch” published to Instagram + Facebook", time: "2d ago" },
    { id: 2, text: "“Reel — latte art in 15 seconds” approved by you", time: "1d ago" },
  ]);
  const [credits, setCredits] = useState(14);
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [nextId, setNextId] = useState(3);

  function log(text: string) {
    setHistory((h) => [{ id: Date.now(), text, time: "just now" }, ...h].slice(0, 6));
  }

  function submitRequest() {
    if (credits <= 0) return;
    const idea = REQUEST_IDEAS[ideaIndex % REQUEST_IDEAS.length];
    const entry: PortalRequest = { id: nextId, title: idea.title, kind: idea.kind, status: "in-review" };
    setRequests((r) => [entry, ...r].slice(0, 5));
    setNextId((n) => n + 1);
    setIdeaIndex((i) => i + 1);
    setCredits((c) => c - 1);
    log(`New request submitted: “${idea.title}” (−1 credit)`);
  }

  function setStatus(id: number, status: RequestStatus) {
    setRequests((r) => r.map((req) => (req.id === id ? { ...req, status } : req)));
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const verbs: Record<RequestStatus, string> = {
      approved: "approved",
      rejected: "rejected — the team will revise",
      published: "published to all channels",
      "in-review": "sent back for edits",
    };
    log(`“${req.title}” ${verbs[status]}`);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Requests panel */}
      <div className="glass-strong rounded-3xl p-6 lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-mist-100">Content requests</h3>
          <div className="flex items-center gap-2">
            <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-mist-300">
              <Coins className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden />
              {credits} credits
            </span>
            <button
              type="button"
              onClick={submitRequest}
              disabled={credits <= 0}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[#fff] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              <Send className="h-3.5 w-3.5" aria-hidden /> New request
            </button>
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {requests.map((request) => (
            <li key={request.id} className="rounded-2xl bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-mist-100">{request.title}</span>
                  <span className="text-[10px] uppercase tracking-wide text-mist-500">{request.kind}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${STATUS_META[request.status].className}`}>
                  {STATUS_META[request.status].label}
                </span>
              </div>

              {request.status === "in-review" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setStatus(request.id, "approved")} className="flex items-center gap-1 rounded-full bg-[#20b8a4]/15 px-3 py-1.5 text-[11px] font-medium text-[#7fe4d6] transition hover:bg-[#20b8a4]/25">
                    <ThumbsUp className="h-3 w-3" aria-hidden /> Approve
                  </button>
                  <button type="button" onClick={() => setStatus(request.id, "rejected")} className="flex items-center gap-1 rounded-full bg-[#f96a4d]/15 px-3 py-1.5 text-[11px] font-medium text-[#ff8b73] transition hover:bg-[#f96a4d]/25">
                    <ThumbsDown className="h-3 w-3" aria-hidden /> Reject
                  </button>
                </div>
              )}
              {request.status === "approved" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setStatus(request.id, "published")} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#fff] transition hover:opacity-90" style={{ backgroundColor: accent }}>
                    <CheckCircle2 className="h-3 w-3" aria-hidden /> Publish
                  </button>
                  <button type="button" onClick={() => setStatus(request.id, "in-review")} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-mist-300 transition hover:bg-white/15">
                    <Pencil className="h-3 w-3" aria-hidden /> Request edits
                  </button>
                </div>
              )}
              {request.status === "rejected" && (
                <div className="mt-3">
                  <button type="button" onClick={() => setStatus(request.id, "in-review")} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-mist-300 transition hover:bg-white/15">
                    <Pencil className="h-3 w-3" aria-hidden /> Revise & resubmit
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* History + usage */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="glass-strong flex-1 rounded-3xl p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-mist-100">
            <Clock3 className="h-4 w-4 text-mist-500" aria-hidden /> History
          </h3>
          <ul className="mt-4 flex flex-col gap-3" aria-live="polite">
            {history.map((entry) => (
              <li key={entry.id} className="flex gap-2.5 text-xs">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
                <span>
                  <span className="block leading-relaxed text-mist-300">{entry.text}</span>
                  <span className="text-[10px] text-mist-600">{entry.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-strong rounded-3xl p-6">
          <p className="text-[11px] uppercase tracking-wider text-mist-500">This month&apos;s usage</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((20 - credits) / 20) * 100}%`, backgroundColor: accent }} />
          </div>
          <p className="mt-2 text-xs text-mist-400">{20 - credits} of 20 monthly content credits used.</p>
        </div>
      </div>
    </div>
  );
}
