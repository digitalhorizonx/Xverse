"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Pencil, Send, ThumbsDown, ThumbsUp, Coins } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n/config";

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

// Theme tokens, not fixed hex: these chips must re-tune themselves for
// light mode like every other surface.
const STATUS_CLASSES: Record<RequestStatus, string> = {
  "in-review": "bg-white/10 text-mist-300",
  approved: "bg-teal-500/15 text-teal-300",
  rejected: "bg-coral-500/15 text-coral-400",
  published: "bg-nebula-500/20 text-nebula-300",
};

/**
 * A working slice of the Xability customer portal: submit a content
 * request, approve / reject / edit it, publish it, and watch history and
 * credits update. All local state — but the exact flow clients use.
 */
export function PortalSimulator({ accent }: { accent: string }) {
  const { dict } = useLocale();
  const t = dict.demos.portal;

  const statusLabels: Record<RequestStatus, string> = {
    "in-review": t.statusInReview,
    approved: t.statusApproved,
    rejected: t.statusRejected,
    published: t.statusPublished,
  };

  const [requests, setRequests] = useState<PortalRequest[]>(() => [
    { id: 1, title: t.seedRequest1, kind: t.kindPost, status: "published" },
    { id: 2, title: t.seedRequest2, kind: t.kindReel, status: "approved" },
  ]);
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    { id: 1, text: t.seedHistory1, time: t.seedHistory1Time },
    { id: 2, text: t.seedHistory2, time: t.seedHistory2Time },
  ]);
  const [credits, setCredits] = useState(14);
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [nextId, setNextId] = useState(3);

  function log(text: string) {
    setHistory((h) => [{ id: Date.now(), text, time: t.justNow }, ...h].slice(0, 6));
  }

  function submitRequest() {
    if (credits <= 0) return;
    const idea = t.ideas[ideaIndex % t.ideas.length];
    const entry: PortalRequest = { id: nextId, title: idea.title, kind: idea.kind, status: "in-review" };
    setRequests((r) => [entry, ...r].slice(0, 5));
    setNextId((n) => n + 1);
    setIdeaIndex((i) => i + 1);
    setCredits((c) => c - 1);
    log(fmt(t.logSubmitted, { title: idea.title }));
  }

  function setStatus(id: number, status: RequestStatus) {
    setRequests((r) => r.map((req) => (req.id === id ? { ...req, status } : req)));
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const logLines: Record<RequestStatus, string> = {
      approved: t.logApproved,
      rejected: t.logRejected,
      published: t.logPublished,
      "in-review": t.logSentBack,
    };
    log(fmt(logLines[status], { title: req.title }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Requests panel */}
      <div className="glass-strong rounded-3xl p-6 lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-mist-100">{t.heading}</h3>
          <div className="flex items-center gap-2">
            <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-mist-300">
              <Coins className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden />
              {fmt(t.credits, { count: credits })}
            </span>
            <button
              type="button"
              onClick={submitRequest}
              disabled={credits <= 0}
              className="flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[#081210] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              <Send className="h-3.5 w-3.5" aria-hidden /> {t.newRequest}
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
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${STATUS_CLASSES[request.status]}`}>
                  {statusLabels[request.status]}
                </span>
              </div>

              {request.status === "in-review" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setStatus(request.id, "approved")} className="flex min-h-[36px] items-center gap-1 rounded-full bg-teal-500/15 px-3 py-1.5 text-[11px] font-medium text-teal-300 transition hover:bg-teal-500/25">
                    <ThumbsUp className="h-3 w-3" aria-hidden /> {t.approve}
                  </button>
                  <button type="button" onClick={() => setStatus(request.id, "rejected")} className="flex min-h-[36px] items-center gap-1 rounded-full bg-coral-500/15 px-3 py-1.5 text-[11px] font-medium text-coral-400 transition hover:bg-coral-500/25">
                    <ThumbsDown className="h-3 w-3" aria-hidden /> {t.reject}
                  </button>
                </div>
              )}
              {request.status === "approved" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setStatus(request.id, "published")} className="flex min-h-[36px] items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#081210] transition hover:opacity-90" style={{ backgroundColor: accent }}>
                    <CheckCircle2 className="h-3 w-3" aria-hidden /> {t.publish}
                  </button>
                  <button type="button" onClick={() => setStatus(request.id, "in-review")} className="flex min-h-[36px] items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-mist-300 transition hover:bg-white/15">
                    <Pencil className="h-3 w-3" aria-hidden /> {t.requestEdits}
                  </button>
                </div>
              )}
              {request.status === "rejected" && (
                <div className="mt-3">
                  <button type="button" onClick={() => setStatus(request.id, "in-review")} className="flex min-h-[36px] items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-mist-300 transition hover:bg-white/15">
                    <Pencil className="h-3 w-3" aria-hidden /> {t.revise}
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
            <Clock3 className="h-4 w-4 text-mist-500" aria-hidden /> {t.history}
          </h3>
          <ul className="mt-4 flex flex-col gap-3" aria-live="polite">
            {history.map((entry) => (
              <li key={entry.id} className="flex gap-2.5 text-xs">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
                <span>
                  <span className="block leading-relaxed text-mist-300">{entry.text}</span>
                  <span className="text-[10px] text-mist-500">{entry.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-strong rounded-3xl p-6">
          <p className="text-[11px] uppercase tracking-wider text-mist-500">{t.usageHeading}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((20 - credits) / 20) * 100}%`, backgroundColor: accent }} />
          </div>
          <p className="mt-2 text-xs text-mist-400">{fmt(t.usageLine, { used: 20 - credits, total: 20 })}</p>
        </div>
      </div>
    </div>
  );
}
