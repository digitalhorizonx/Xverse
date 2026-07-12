"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Play, RotateCcw, User, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { AiAgentProfile, AutomationWorkflow, ChatTurn } from "@/data/types";

/**
 * The agent conversation, played live: messages appear on a timer with a
 * typing indicator, replayable. Feels like watching the product work.
 */
export function AiChatDemo({ script, agents, accent }: { script: ChatTurn[]; agents: AiAgentProfile[]; accent: string }) {
  const { dict } = useLocale();
  const labels = dict.demos.ai;
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || visibleCount >= script.length) {
      if (visibleCount >= script.length) setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), visibleCount === 0 ? 300 : 1400);
    return () => clearTimeout(timer);
  }, [playing, visibleCount, script.length]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleCount]);

  const done = visibleCount >= script.length;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Chat window */}
      <div className="glass-strong flex h-[420px] flex-col overflow-hidden rounded-3xl lg:col-span-3">
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}22` }}>
            <Bot className="h-4 w-4" style={{ color: accent }} aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-mist-100">{labels.chatHeader}</span>
            <span className="flex items-center gap-1.5 text-[10px] text-mist-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: accent }} aria-hidden />
              {labels.online}
            </span>
          </span>
        </div>

        <div ref={logRef} className="flex-1 space-y-3 overflow-y-auto p-5" aria-live="polite">
          {script.slice(0, visibleCount).map((turn, index) => (
            <div key={index} className={`flex gap-2.5 ${turn.from === "customer" ? "justify-end" : ""}`}>
              {turn.from === "agent" && (
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}22` }}>
                  <Bot className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden />
                </span>
              )}
              <p
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  turn.from === "customer" ? "bg-white/10 text-mist-100" : "text-mist-100"
                }`}
                style={turn.from === "agent" ? { backgroundColor: `${accent}1c` } : undefined}
              >
                {turn.text}
              </p>
              {turn.from === "customer" && (
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <User className="h-3.5 w-3.5 text-mist-300" aria-hidden />
                </span>
              )}
            </div>
          ))}
          {playing && !done && (
            <div className="flex items-center gap-1.5 ps-9 text-mist-500" aria-hidden>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
            </div>
          )}
          {visibleCount === 0 && !playing && (
            <p className="pt-24 text-center text-xs text-mist-500">{labels.pressPlay}</p>
          )}
        </div>

        <div className="border-t border-white/5 p-3">
          <button
            type="button"
            onClick={() => {
              if (done) setVisibleCount(0);
              setPlaying(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold text-[#fff] transition hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            {done ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
            {done ? labels.replay : playing ? labels.playing : labels.play}
          </button>
        </div>
      </div>

      {/* Agent roster */}
      <div className="flex flex-col gap-3 lg:col-span-2">
        {agents.map((agent) => (
          <div key={agent.name} className="glass-strong flex items-start gap-3 rounded-3xl p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accent}22` }}>
              <Bot className="h-5 w-5" style={{ color: accent }} aria-hidden />
            </span>
            <span>
              <span className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-mist-100">{agent.name}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-mist-400">{agent.role}</span>
              </span>
              <span className="mt-1 block text-xs text-mist-400">{agent.description}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Trigger → steps → outcome, traced step by step on click. */
export function AiWorkflowsDemo({ workflows, accent }: { workflows: AutomationWorkflow[]; accent: string }) {
  const { dict } = useLocale();
  const labels = dict.demos.ai;
  const [activeId, setActiveId] = useState(workflows[0]?.id);
  const [progress, setProgress] = useState(0);
  const workflow = workflows.find((w) => w.id === activeId) ?? workflows[0];

  useEffect(() => {
    setProgress(0);
  }, [activeId]);

  useEffect(() => {
    if (!workflow || progress === 0 || progress > workflow.steps.length) return;
    const timer = setTimeout(() => setProgress((p) => p + 1), 550);
    return () => clearTimeout(timer);
  }, [progress, workflow]);

  if (!workflow) return null;
  const finished = progress > workflow.steps.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label={labels.workflowsAria}>
        {workflows.map((w) => (
          <button
            key={w.id}
            type="button"
            role="tab"
            aria-selected={w.id === workflow.id}
            onClick={() => setActiveId(w.id)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              w.id === workflow.id ? "text-white" : "glass text-mist-400 hover:text-mist-200"
            }`}
            style={w.id === workflow.id ? { backgroundColor: `${accent}33`, boxShadow: `inset 0 0 0 1px ${accent}66` } : undefined}
          >
            {w.name}
          </button>
        ))}
      </div>

      <div className="glass-strong rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-mist-400">
            <Zap className="h-4 w-4" style={{ color: accent }} aria-hidden />
            {labels.trigger} <span className="text-mist-200">{workflow.trigger}</span>
          </p>
          <button
            type="button"
            onClick={() => setProgress(1)}
            className="rounded-full px-4 py-2 text-xs font-semibold text-[#fff] transition hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            {finished ? labels.runAgain : progress > 0 ? labels.running : labels.run}
          </button>
        </div>

        <ol className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
          {workflow.steps.map((step, index) => {
            const state = progress > index + 1 || finished ? "done" : progress === index + 1 ? "active" : "idle";
            return (
              <li key={step} className="flex flex-1 items-center gap-2 sm:flex-col sm:gap-2 sm:text-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                    state === "idle" ? "bg-white/10 text-mist-500" : "text-[#0a0a14]"
                  } ${state === "active" ? "scale-110" : ""}`}
                  style={state !== "idle" ? { backgroundColor: accent, boxShadow: `0 0 16px ${accent}66` } : undefined}
                >
                  {state === "done" ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : index + 1}
                </span>
                <span className={`text-[11px] leading-tight transition ${state === "idle" ? "text-mist-500" : "text-mist-200"}`}>
                  {step}
                </span>
                {index < workflow.steps.length - 1 && (
                  <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-mist-600 sm:mx-auto sm:mt-1 sm:block" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>

        <p
          className={`mt-5 rounded-2xl px-4 py-3 text-center text-xs font-medium transition-all duration-500 ${
            finished ? "opacity-100" : "opacity-40"
          }`}
          style={{ backgroundColor: `${accent}1c`, color: finished ? "#fff" : undefined }}
        >
          {workflow.outcome}
        </p>
      </div>
    </div>
  );
}
