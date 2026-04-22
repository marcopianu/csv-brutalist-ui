export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-black px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-end justify-between border-b-4 border-black pb-4">
          <h1 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">
            Chart-Agent
          </h1>
        </div>

        <div className="space-y-5">
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
                  Drop file here
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] opacity-60">
                  or click to upload
                </p>
              </div>
            </label>

            <input id="csv-upload" type="file" accept=".csv" className="hidden" />
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
              placeholder="Describe the chart you want..."
              className="min-h-[180px] w-full resize-none border-4 border-black bg-neutral-50 p-4 text-[15px] outline-none placeholder:text-black/40 focus:bg-white"
            />
          </section>
        </div>
      </div>
    </main>
  );
}