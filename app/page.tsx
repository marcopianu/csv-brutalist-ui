"use client";

import { FormEvent, useState } from "react";

const WEBHOOK_URL =
  "https://vastly-subdued-nylon.ngrok-free.dev/webhook/chart-agent";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const isReady = !!file && prompt.trim() !== "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isReady || !file) return;

    try {
      setSending(true);
      setStatus("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt.trim());

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      if (!res.ok) {
        setStatus(`failed ${res.status}: ${text || "request failed"}`);
        return;
      }

      setStatus(`sent ${res.status}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 text-black md:px-8 md:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 border-b-4 border-black pb-4">
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">
              Chart-Agent
            </h1>
            <span className="border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]">
              CSV → Prompt
            </span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <section className="border-4 border-black bg-white p-4 shadow-[10px_10px_0_0_#000] md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-[0.22em]">
                Upload CSV
              </label>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
                .csv only
              </span>
            </div>

            <label
              htmlFor="csv-upload"
              className="group flex min-h-[220px] cursor-pointer items-center justify-center border-4 border-dashed border-black bg-neutral-100 px-6 text-center transition hover:-translate-y-[2px] hover:bg-white"
            >
              <div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-4 border-black bg-white text-xl font-black">
                  CSV
                </div>
                <p className="text-lg font-black uppercase tracking-[-0.04em]">
                  {file?.name || "Drop file here"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] opacity-60">
                  {file ? "ready" : "or click to upload"}
                </p>
              </div>
            </label>

            <input
              id="csv-upload"
              name="file"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </section>

          <section className="border-4 border-black bg-white p-4 shadow-[10px_10px_0_0_#000] md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <label
                htmlFor="prompt"
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
              >
                Insert Prompt
              </label>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
                plain text
              </span>
            </div>

            <textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the chart you want..."
              className="min-h-[180px] w-full resize-none border-4 border-black bg-neutral-50 p-4 text-[15px] outline-none placeholder:text-black/40 focus:bg-white"
            />

            <button
              type="submit"
              disabled={!isReady || sending}
              className="mt-4 w-full border-4 border-black bg-black px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:-translate-y-[2px] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
            >
              {sending ? "Sending..." : "Send CSV + Prompt"}
            </button>

            {status && (
              <p className="mt-3 break-words text-center text-[11px] font-black uppercase tracking-[0.12em]">
                {status}
              </p>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}