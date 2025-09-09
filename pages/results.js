// pages/results.js
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

export default function ResultsPage() {
  const [lang, setLang] = useState("hu");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [roundIdFilter, setRoundIdFilter] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const qs = new URLSearchParams();
      if (roundIdFilter) qs.set("round_id", roundIdFilter);
      const res = await fetch(`/api/list-submissions?${qs.toString()}`);
      if (!res.ok) {
        let msg = `Error ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }
      const j = await res.json();
      setRows(Array.isArray(j.rows) ? j.rows : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = lang === "hu" ? "Eredmények (teszt)" : "Results (test)";
  const countLabel =
    lang === "hu" ? `Találatok: ${rows.length}` : `Rows: ${rows.length}`;

  return (
    <>
      <Head>
        <title>GrandLucky — {title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main
        className="min-h-screen w-full flex items-start justify-center p-6"
        style={{
          backgroundImage: "url('/BG-sikeres reg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black/70 text-white w-[96%] max-w-5xl rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">GrandLucky — {title}</h1>
            <button
              onClick={() => setLang((v) => (v === "hu" ? "en" : "hu"))}
              className="px-3 py-1 rounded-full font-semibold"
              style={{ backgroundColor: "#faaf3b", color: "black" }}
            >
              {lang.toUpperCase()}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-end mb-4">
            <div className="flex-1">
              <label className="block text-sm opacity-80 mb-1">
                {lang === "hu" ? "Szűrés round_id szerint" : "Filter by round_id"}
              </label>
              <input
                value={roundIdFilter}
                onChange={(e) => setRoundIdFilter(e.target.value)}
                placeholder={lang === "hu" ? "round_id (opcionális)" : "round_id (optional)"}
                className="w-full px-3 py-2 rounded-md text-black"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={load}
                className="px-4 py-2 rounded-md font-semibold text-black"
                style={{ backgroundColor: "#faaf3b" }}
              >
                {lang === "hu" ? "Frissítés" : "Refresh"}
              </button>
              <button
                onClick={() => {
                  setRoundIdFilter("");
                  setTimeout(load, 0);
                }}
                className="px-4 py-2 rounded-md border border-white/60 hover:border-white transition"
              >
                {lang === "hu" ? "Szűrő törlése" : "Clear filter"}
              </button>
            </div>
          </div>

          <p className="opacity-80 text-sm mb-3">{countLabel}</p>
          {err && <p className="text-red-300 mb-3">{err}</p>}
          {loading && <p className="opacity-90">{lang === "hu" ? "Betöltés…" : "Loading…"}</p>}

          {!loading && rows.length > 0 && (
            <div className="overflow-auto rounded-lg">
              <table className="min-w-full text-left bg-white/5 rounded-lg">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-3 py-2">Username</th>
                    <th className="px-3 py-2">{lang === "hu" ? "Helyes" : "Correct"}</th>
                    <th className="px-3 py-2">{lang === "hu" ? "Idő (s)" : "Time (s)"}</th>
                    <th className="px-3 py-2">ms</th>
                    <th className="px-3 py-2">round_id</th>
                    <th className="px-3 py-2">{lang === "hu" ? "Létrehozva" : "Created"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const sec = (Number(r.total_time_ms || 0) / 1000).toFixed(2);
                    const dt = r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "";
                    return (
                      <tr key={i} className="odd:bg-white/0 even:bg-white/5">
                        <td className="px-3 py-2 font-semibold">{r.username}</td>
                        <td className="px-3 py-2">{r.correct_count}</td>
                        <td className="px-3 py-2">{sec}</td>
                        <td className="px-3 py-2">{r.total_time_ms}</td>
                        <td className="px-3 py-2 font-mono text-xs break-all">{r.round_id}</td>
                        <td className="px-3 py-2">{dt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rows.length === 0 && !err && (
            <p className="opacity-80">
              {lang === "hu"
                ? "Nincs megjeleníthető eredmény. Játssz le egy kvízt, és a Mentés gombbal rögzítsd."
                : "No results yet. Finish a quiz and click Save on the final page."}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
