"use client";

import { ArrowLeft, Baby, Check, Download, LoaderCircle, RefreshCw, Search, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";

type Rsvp = {
  id: string;
  guestName: string;
  attendance: "yes" | "no";
  adultCount: number;
  childCount: number;
  note: string;
  createdAt: number;
};

type Filter = "all" | "yes" | "no";

const dateFormatter = new Intl.DateTimeFormat("mn-MN", {
  timeZone: "Asia/Ulaanbaatar",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function escapeCsv(value: string | number) {
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

export default function AdminDashboard() {
  const [responses, setResponses] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const loadResponses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/rsvps", { cache: "no-store" });
      if (!response.ok) throw new Error("request_failed");
      const data = (await response.json()) as { responses: Rsvp[] };
      setResponses(data.responses);
    } catch {
      setError("Хариунуудыг ачаалж чадсангүй. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResponses();
  }, [loadResponses]);

  const stats = useMemo(() => {
    const attending = responses.filter((item) => item.attendance === "yes");
    const adults = attending.reduce((sum, item) => sum + item.adultCount, 0);
    const children = attending.reduce((sum, item) => sum + item.childCount, 0);
    return {
      total: responses.length,
      attending: attending.length,
      declined: responses.length - attending.length,
      adults,
      children,
      people: adults + children,
    };
  }, [responses]);

  const visibleResponses = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("mn-MN");
    return responses.filter((item) => {
      const matchesFilter = filter === "all" || item.attendance === filter;
      const matchesQuery = !normalized || item.guestName.toLocaleLowerCase("mn-MN").includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, responses]);

  function downloadCsv() {
    const rows = [
      ["Зочны нэр", "Хариу", "Том хүн", "Хүүхэд", "Нийт хүн", "Илгээсэн огноо"],
      ...responses.map((item) => [
        item.guestName,
        item.attendance === "yes" ? "Очно" : "Очихгүй",
        item.adultCount,
        item.childCount,
        item.adultCount + item.childCount,
        dateFormatter.format(new Date(item.createdAt)),
      ]),
    ];
    const csv = "\ufeff" + rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `togtuun-rsvp-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className={styles.page}>
      <div className={styles.pattern} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <a href="/" className={styles.back}><ArrowLeft size={16} /> Урилга руу буцах</a>
            <p className={styles.eyebrow}>ТОГТУУНЫ 1 НАСНЫ БАЯР</p>
            <h1>Ирцийн хариу</h1>
            <p className={styles.welcome}>Урилгын хариунууд бодит хугацаанд шинэчлэгдэнэ.</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => void loadResponses()} disabled={loading} className={styles.secondaryButton}>
              <RefreshCw size={17} className={loading ? styles.spin : ""} /> Шинэчлэх
            </button>
            <button onClick={downloadCsv} disabled={!responses.length} className={styles.primaryButton}>
              <Download size={17} /> CSV татах
            </button>
          </div>
        </header>

        <section className={styles.stats} aria-label="Ирцийн тойм">
          <article><span><Users size={20} /></span><p>Нийт хариу</p><strong>{stats.total}</strong><small>гэр бүл / зочин</small></article>
          <article><span><Check size={20} /></span><p>Очно</p><strong>{stats.attending}</strong><small>{stats.people} хүн ирнэ</small></article>
          <article><span><Users size={20} /></span><p>Том хүн</p><strong>{stats.adults}</strong><small>нийт</small></article>
          <article><span><Baby size={20} /></span><p>Хүүхэд</p><strong>{stats.children}</strong><small>3–12 нас</small></article>
          <article><span><X size={20} /></span><p>Очихгүй</p><strong>{stats.declined}</strong><small>хариу</small></article>
        </section>

        <section className={styles.panel}>
          <div className={styles.toolbar}>
            <div className={styles.search}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Нэрээр хайх…" aria-label="Нэрээр хайх" /></div>
            <div className={styles.filters}>
              {([['all', 'Бүгд'], ['yes', 'Очно'], ['no', 'Очихгүй']] as const).map(([value, label]) => (
                <button key={value} onClick={() => setFilter(value)} className={filter === value ? styles.activeFilter : ""}>{label}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.state}><LoaderCircle className={styles.spin} size={28} /><p>Хариунуудыг ачаалж байна…</p></div>
          ) : error ? (
            <div className={styles.state}><p>{error}</p><button onClick={() => void loadResponses()}>Дахин оролдох</button></div>
          ) : visibleResponses.length === 0 ? (
            <div className={styles.state}><Users size={30} /><p>{responses.length ? "Хайлтад тохирох хариу олдсонгүй." : "Одоогоор ирцийн хариу ирээгүй байна."}</p></div>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Зочны нэр</th><th>Хариу</th><th>Том хүн</th><th>Хүүхэд</th><th>Нийт</th><th>Илгээсэн</th></tr></thead>
                <tbody>
                  {visibleResponses.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Зочны нэр"><strong>{item.guestName}</strong></td>
                      <td data-label="Хариу"><span className={item.attendance === "yes" ? styles.yesBadge : styles.noBadge}>{item.attendance === "yes" ? <><Check size={13} /> Очно</> : <><X size={13} /> Очихгүй</>}</span></td>
                      <td data-label="Том хүн">{item.adultCount}</td>
                      <td data-label="Хүүхэд">{item.childCount}</td>
                      <td data-label="Нийт">{item.adultCount + item.childCount}</td>
                      <td data-label="Илгээсэн"><time dateTime={new Date(item.createdAt).toISOString()}>{dateFormatter.format(new Date(item.createdAt))}</time></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
