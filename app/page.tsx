"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const WEBHOOK_URL =
  "https://vastly-subdued-nylon.ngrok-free.dev/webhook-test/chart-agent";

function ChartBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const mulberry32 = (seed: number) => () => {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const shuffle = <T,>(array: T[], rng: () => number) => {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const canPlace = (
      grid: boolean[][],
      row: number,
      col: number,
      spanCols: number,
      spanRows: number
    ) => {
      if (row + spanRows > grid.length || col + spanCols > grid[0].length) {
        return false;
      }

      for (let r = row; r < row + spanRows; r++) {
        for (let c = col; c < col + spanCols; c++) {
          if (grid[r][c]) return false;
        }
      }

      return true;
    };

    const occupy = (
      grid: boolean[][],
      row: number,
      col: number,
      spanCols: number,
      spanRows: number
    ) => {
      for (let r = row; r < row + spanRows; r++) {
        for (let c = col; c < col + spanCols; c++) {
          grid[r][c] = true;
        }
      }
    };

    const createLayout = (width: number, height: number) => {
      const cell = clamp(Math.round(width / 11), 92, 128);
      const cols = Math.max(1, Math.ceil(width / cell));
      const rows = Math.max(1, Math.ceil(height / cell));
      const grid = Array.from({ length: rows }, () => Array(cols).fill(false));
      const tiles: {
        row: number;
        col: number;
        spanCols: number;
        spanRows: number;
        size: "small" | "medium" | "large";
      }[] = [];

      for (let macroRow = 0; macroRow < rows; macroRow += 3) {
        for (let macroCol = 0; macroCol < cols; macroCol += 3) {
          const rng = mulberry32(
            rows * 1000 + cols * 100 + macroRow * 13 + macroCol * 17
          );

          const anchors = shuffle(
            [
              [macroRow, macroCol],
              [macroRow, macroCol + 1],
              [macroRow + 1, macroCol],
              [macroRow + 1, macroCol + 1],
            ] as const,
            rng
          );

          const shapes =
            (macroRow / 3 + macroCol / 3) % 2 === 0
              ? [
                  { spanCols: 2, spanRows: 2, size: "large" as const },
                  { spanCols: 2, spanRows: 1, size: "medium" as const },
                  { spanCols: 1, spanRows: 2, size: "medium" as const },
                ]
              : [
                  { spanCols: 2, spanRows: 1, size: "medium" as const },
                  { spanCols: 1, spanRows: 2, size: "medium" as const },
                  { spanCols: 2, spanRows: 2, size: "large" as const },
                ];

          let placed = false;

          for (const shape of shapes) {
            for (const [row, col] of anchors) {
              if (canPlace(grid, row, col, shape.spanCols, shape.spanRows)) {
                occupy(grid, row, col, shape.spanCols, shape.spanRows);
                tiles.push({
                  row,
                  col,
                  spanCols: shape.spanCols,
                  spanRows: shape.spanRows,
                  size: shape.size,
                });
                placed = true;
                break;
              }
            }
            if (placed) break;
          }
        }
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (grid[row][col]) continue;

          const preferWide = (row + col) % 2 === 0;
          const wantsMedium =
            (row % 3 === 1 && col % 3 !== 0) || (row + col) % 5 === 0;

          if (wantsMedium) {
            if (preferWide && canPlace(grid, row, col, 2, 1)) {
              occupy(grid, row, col, 2, 1);
              tiles.push({
                row,
                col,
                spanCols: 2,
                spanRows: 1,
                size: "medium",
              });
              continue;
            }

            if (canPlace(grid, row, col, 1, 2)) {
              occupy(grid, row, col, 1, 2);
              tiles.push({
                row,
                col,
                spanCols: 1,
                spanRows: 2,
                size: "medium",
              });
              continue;
            }

            if (canPlace(grid, row, col, 2, 1)) {
              occupy(grid, row, col, 2, 1);
              tiles.push({
                row,
                col,
                spanCols: 2,
                spanRows: 1,
                size: "medium",
              });
              continue;
            }
          }

          occupy(grid, row, col, 1, 1);
          tiles.push({ row, col, spanCols: 1, spanRows: 1, size: "small" });
        }
      }

      return { tiles, cell, rows, cols };
    };

    const buildTypeDeck = (count: number, seed: number) => {
      const base = ["bar", "line", "pie", "scatter", "bar", "line"] as const;
      const deck: ("bar" | "line" | "pie" | "scatter")[] = [];
      while (deck.length < count) deck.push(...base);
      return shuffle(deck, mulberry32(seed)).slice(0, count);
    };

    const drawChart = (
      tile: {
        row: number;
        col: number;
        spanCols: number;
        spanRows: number;
        size: "small" | "medium" | "large";
      },
      type: "bar" | "line" | "pie" | "scatter",
      cell: number
    ) => {
      const rng = mulberry32(
        (tile.row + 1) * 10007 +
          (tile.col + 1) * 7919 +
          tile.spanCols * 101 +
          tile.spanRows * 211
      );

      const rand = (min: number, max: number) => rng() * (max - min) + min;
      const randInt = (min: number, max: number) =>
        Math.floor(rand(min, max + 1));

      const areaX = tile.col * cell;
      const areaY = tile.row * cell;
      const areaW = tile.spanCols * cell;
      const areaH = tile.spanRows * cell;

      const pad =
        tile.size === "large" ? 16 : tile.size === "medium" ? 13 : 10;
      const offset = tile.size === "small" ? 4 : 6;

      const x = areaX + pad + rand(-offset, offset);
      const y = areaY + pad + rand(-offset, offset);
      let w = Math.max(30, areaW - pad * 2);
      let h = Math.max(26, areaH - pad * 2);

      if (tile.size === "small") {
        if (rng() > 0.5) w *= rand(0.84, 0.94);
        else h *= rand(0.84, 0.94);
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.lineWidth = Math.max(1.1, Math.min(2.2, Math.min(w, h) * 0.018));
      ctx.strokeStyle = `rgba(20, 20, 30, ${
        tile.size === "large" ? 0.13 : tile.size === "medium" ? 0.11 : 0.09
      })`;
      ctx.fillStyle = `rgba(40, 40, 60, ${
        tile.size === "large" ? 0.06 : tile.size === "medium" ? 0.05 : 0.04
      })`;

      const dataPoints = randInt(4, 8);
      const values = Array.from(
        { length: dataPoints },
        () => rand(0.22, 0.9) * h
      );

      if (type === "bar") {
        const barWidth = (w / dataPoints) * 0.68;
        const gap = (w - barWidth * dataPoints) / (dataPoints + 1);

        for (let i = 0; i < dataPoints; i++) {
          const barX = gap + i * (barWidth + gap);
          const barHeight = values[i];
          ctx.fillRect(barX, h - barHeight, barWidth, barHeight);
          ctx.strokeRect(barX, h - barHeight, barWidth, barHeight);
        }
      }

      if (type === "line") {
        ctx.beginPath();
        const stepX = dataPoints > 1 ? w / (dataPoints - 1) : w;

        for (let i = 0; i < dataPoints; i++) {
          const px = i * stepX;
          const py = h - values[i];
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.stroke();

        ctx.fillStyle = `rgba(20, 20, 30, ${
          tile.size === "large" ? 0.14 : 0.12
        })`;

        for (let i = 0; i < dataPoints; i++) {
          ctx.beginPath();
          ctx.arc(
            i * stepX,
            h - values[i],
            Math.max(2, Math.min(4.5, w * 0.022)),
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      }

      if (type === "pie") {
        const radius = Math.min(w, h) * 0.36;
        const centerX = w / 2;
        const centerY = h / 2;
        let startAngle = 0;
        const total = values.reduce((sum, value) => sum + value, 0);

        for (let i = 0; i < dataPoints; i++) {
          const sliceAngle = (values[i] / total) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          startAngle += sliceAngle;
        }
      }

      if (type === "scatter") {
        const pointCount = randInt(8, 16);
        ctx.fillStyle = `rgba(20, 20, 30, ${
          tile.size === "large" ? 0.12 : 0.1
        })`;

        for (let i = 0; i < pointCount; i++) {
          const px = rand(8, Math.max(10, w - 8));
          const py = rand(8, Math.max(10, h - 8));
          ctx.beginPath();
          ctx.arc(
            px,
            py,
            rand(2, Math.max(3, Math.min(7, w * 0.035))),
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      }

      ctx.restore();
    };

    const draw = (width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);
      const { tiles, cell, rows, cols } = createLayout(width, height);
      const types = buildTypeDeck(tiles.length, rows * 100 + cols * 10 + 7);

      tiles.forEach((tile, index) => {
        drawChart(tile, types[index], cell);
      });
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(width, height);
    };

    window.addEventListener("resize", resize);
    resize();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ pointerEvents: "none" }}
    />
  );
}

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
    <>
      <ChartBackground />

      <main className="relative min-h-screen bg-transparent px-4 py-6 text-black md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 border-b-4 border-black pb-4">
            <div className="flex items-end justify-between gap-4">
              <h1 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-5xl">
                Chart-Agent
              </h1>
              <span className="border-2 border-black bg-white/80 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-sm">
                CSV → Prompt
              </span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <section className="border-4 border-black bg-white/85 p-4 shadow-[10px_10px_0_0_#000] backdrop-blur-sm md:p-5">
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
                className="group flex min-h-[220px] cursor-pointer items-center justify-center border-4 border-dashed border-black bg-neutral-100/80 px-6 text-center transition hover:-translate-y-[2px] hover:bg-white/90"
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

            <section className="border-4 border-black bg-white/85 p-4 shadow-[10px_10px_0_0_#000] backdrop-blur-sm md:p-5">
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
                className="min-h-[180px] w-full resize-none border-4 border-black bg-neutral-50/80 p-4 text-[15px] outline-none placeholder:text-black/40 focus:bg-white/90"
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
    </>
  );
}