"use client";

import { useState } from "react";

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [prompt, setPrompt] = useState("");

  const isReady = fileName.trim() !== "" && prompt.trim() !== "";

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 text-black md:px-8 md:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 border-b-4 border-black pb-4">
          <h1 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">
            Chart-Agent
          </h1>
        </div>

        <form className="space-y-5" method="POST" encType="multipart/form-data">
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
              className="group flex min-h-[240px] cursor-pointer items-center justify-center border-4 border-dashed border-black bg-neutral-100 px-6 text-center transition hover:-translate-y-[2px] hover:bg-white"
            >
              <div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-4 border-black bg-white text-xl font-black">
                  CSV
                </div>
                <p className="text-lg font-black uppercase tracking-[-0.04em]">
                  {fileName || "Drop file here"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] opacity-60">
                  {fileName ? "ready" : "or click to upload"}
                </p>
              </div>
            </label>

            <input
              id="csv-upload"
              name="file"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
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
              disabled={!isReady}
              className="mt-4 w-full border-4 border-black bg-black px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:-translate-y-[2px] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
            >
              Send CSV + Prompt
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}