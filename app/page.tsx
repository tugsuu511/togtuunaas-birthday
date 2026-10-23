"use client";

import {
  ArrowDown,
  Baby,
  CalendarDays,
  Camera,
  Check,
  Minus,
  Plus,
  Heart,
  LoaderCircle,
  MapPin,
  Share2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Attendance = "yes" | "no";

const EVENT_DATE = new Date("2026-11-06T00:00:00+08:00");

function Counter({
  label,
  hint,
  value,
  onChange,
  icon,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="counter-row">
      <div className="counter-copy">
        <span className="counter-icon">{icon}</span>
        <span>
          <strong>{label}</strong>
          <small>{hint}</small>
        </span>
      </div>
      <div className="counter-control" aria-label={`${label}: ${value}`}>
        <button type="button" aria-label={`${label} хасах`} onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}>
          <Minus size={18} />
        </button>
        <output>{value}</output>
        <button type="button" aria-label={`${label} нэмэх`} onClick={() => onChange(Math.min(20, value + 1))}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <i key={i} style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const daysLeft = useMemo(() => Math.max(0, Math.ceil((EVENT_DATE.getTime() - Date.now()) / 86_400_000)), []);

  useEffect(() => {
    fetch("/api/photo", { method: "HEAD", cache: "no-store" })
      .then((response) => {
        if (response.ok) setPhotoUrl(`/api/photo?v=${Date.now()}`);
      })
      .catch(() => undefined);
  }, [photoVersion]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function uploadPhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      setToast("Зөвхөн зураг сонгоно уу.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setToast("Зургийн хэмжээ 8MB-аас бага байх хэрэгтэй.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPhotoUrl(localUrl);
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("photo", file);
      const response = await fetch("/api/photo", { method: "POST", body });
      if (!response.ok) throw new Error("upload failed");
      setPhotoVersion((version) => version + 1);
      setToast("Зураг урилгын загварт хадгалагдлаа.");
    } catch {
      setToast("Зургийг хадгалж чадсангүй. Дахин оролдоно уу.");
    } finally {
      setIsUploading(false);
      window.setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
    }
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const guestName = String(form.get("guestName") || "").trim();
    if (!guestName) {
      setToast("Нэрээ оруулна уу.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          attendance,
          adults: attendance === "yes" ? adults : 0,
          children: attendance === "yes" ? children : 0,
          note: String(form.get("note") || "").trim(),
        }),
      });
      if (!response.ok) throw new Error("submit failed");
      setSubmitted(true);
      window.setTimeout(() => document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setToast("Хариуг хадгалж чадсангүй. Дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function shareInvitation() {
    const shareData = {
      title: "Т.Тогтуун — 1 нас",
      text: "Т.Тогтуун хүүхдийн 1 насны төрсөн өдрийн урилга",
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setToast("Урилгын холбоос хууллаа.");
      }
    } catch {
      // The native share sheet may be dismissed intentionally.
    }
  }

  return (
    <main className={opened ? "site invitation-open" : "site"}>
      <div className="paper-noise" aria-hidden="true" />

      {!opened && (
        <section className="opening-screen" aria-label="Урилгаа нээх">
          <div className="opening-orbit orbit-one" />
          <div className="opening-orbit orbit-two" />
          <div className="envelope-wrap">
            <div className="tiny-stars" aria-hidden="true">✦ · ✧ · ✦</div>
            <p className="eyebrow">ТАНД ИРҮҮЛСЭН УРИЛГА</p>
            <div className="envelope" aria-hidden="true">
              <div className="envelope-back" />
              <div className="letter-preview">
                <Baby size={24} />
                <strong>Тогтуун</strong>
                <span>нэг нас</span>
              </div>
              <div className="envelope-front" />
              <div className="wax-seal"><span>1</span></div>
            </div>
            <button className="open-button" onClick={() => setOpened(true)}>
              Урилгаа нээх <Sparkles size={17} />
            </button>
            <p className="opening-date">2026 · 11 · 06</p>
          </div>
        </section>
      )}

      <div className="invitation-content">
        <nav className="topbar">
          <a className="wordmark" href="#top" aria-label="Эхлэл рүү">
            <span>T</span>
            <div>TOGTUUN<small>ONE YEAR OLD</small></div>
          </a>
          <button className="icon-button" onClick={shareInvitation} aria-label="Урилгыг хуваалцах"><Share2 size={19} /></button>
        </nav>

        <section className="hero" id="top">
          <div className="balloon balloon-peach" aria-hidden="true"><span /></div>
          <div className="balloon balloon-blue" aria-hidden="true"><span /></div>
          <div className="hero-copy reveal reveal-1">
            <p className="eyebrow"><span /> БЯЦХАН БАЯР <span /></p>
            <h1><em>Тогтуун</em><br />нэг нас хүрлээ!</h1>
            <p className="intro">Бидний аз жаргал, бяцхан Тогтууны<br className="desktop-break" /> анхны төрсөн өдрийг хамтдаа тэмдэглэцгээе.</p>
          </div>

          <div className="photo-stage reveal reveal-2">
            <div className="spark spark-a">✦</div>
            <div className="spark spark-b">✧</div>
            <div className="photo-frame">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Т.Тогтуун хүүхдийн зураг" />
              ) : (
                <div className="photo-placeholder"><div className="one-mark">1</div><span>энд Тогтууны<br />зураг орно</span></div>
              )}
              <button className="photo-action" onClick={() => fileRef.current?.click()} disabled={isUploading}>
                {isUploading ? <LoaderCircle className="spin" size={17} /> : <Camera size={17} />}
                {photoUrl ? "Зураг солих" : "Зураг нэмэх"}
              </button>
              <input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadPhoto(file);
                event.target.value = "";
              }} />
            </div>
            <div className="mini-cake" aria-hidden="true"><i /><b>1</b><span /></div>
          </div>

          <a className="scroll-cue" href="#details">Доош үзэх <ArrowDown size={16} /></a>
        </section>

        <section className="details-section" id="details">
          <div className="section-kicker">SAVE THE DATE</div>
          <h2>Онцгой өдрийг<br /><em>хамтдаа</em> өнгөрүүлье</h2>
          <div className="date-card">
            <div className="date-month">11 САР</div>
            <div className="date-main"><span>БААСАН</span><strong>06</strong><span>2026 ОН</span></div>
            <div className="date-note"><CalendarDays size={20} /><p><strong>{daysLeft} өдөр үлдлээ</strong><small>Товлосон өдрөө хадгалаарай</small></p></div>
          </div>

          <div className="info-grid">
            <article><span className="info-icon"><Heart size={22} /></span><p>НЭГ НАСНЫ БАЯР</p><h3>2026.11.06</h3><small>Баасан гараг</small></article>
            <article><span className="info-icon"><MapPin size={22} /></span><p>ЦАГ & БАЙРШИЛ</p><h3>Удахгүй мэдээлнэ</h3><small>Гэр бүлийнхэнтэй холбогдоорой</small></article>
          </div>
        </section>

        <section className="memory-section">
          <div className="memory-number">01</div>
          <div className="memory-copy">
            <p className="eyebrow">АНХНЫ ЖИЛ · АНХНЫ ДУРСАМЖ</p>
            <h2>Инээд, хайр,<br /><em>бяцхан гайхамшиг</em></h2>
            <p>Тогтууны анхны төрсөн өдрийн дурсамжид таны инээмсэглэл хамгийн нандин бэлэг байх болно.</p>
          </div>
          <div className="doodle-line" aria-hidden="true" />
        </section>

        <section className="rsvp-section" id="rsvp">
          <div className="rsvp-heading">
            <p className="eyebrow">RSVP · ХАРИУ ӨГӨХ</p>
            <h2>{submitted ? "Хариу ирлээ!" : "Та бидэнтэй хамт байх уу?"}</h2>
            <p>{submitted ? "Баярлалаа. Таны хариуг амжилттай хадгаллаа." : "Ирэх эсэхээ 2026.10.30-ны дотор мэдэгдээрэй."}</p>
          </div>

          {submitted ? (
            <div className="success-card" role="status">
              <Confetti />
              <div className="success-check"><Check size={34} strokeWidth={2.2} /></div>
              <h3>{attendance === "yes" ? "Тантай уулзахыг тэсэн ядан хүлээж байна!" : "Хариу өгсөнд баярлалаа"}</h3>
              <p>{attendance === "yes" ? `${adults} том хүн${children ? `, ${children} хүүхэд` : ""} ирэхээр бүртгэгдлээ.` : "Энэ удаа хамт байж чадахгүй ч таны сайхан ерөөл бидэнтэй хамт байна."}</p>
              <button onClick={() => setSubmitted(false)}>Хариугаа өөрчлөх</button>
            </div>
          ) : (
            <form className="rsvp-card" onSubmit={submitRsvp}>
              <label className="field-label" htmlFor="guestName">Таны нэр</label>
              <input id="guestName" name="guestName" type="text" placeholder="Жишээ: Бат болон гэр бүл" maxLength={80} required />
              <fieldset>
                <legend>Та хүрэлцэн ирэх үү?</legend>
                <div className="attendance-options">
                  <button type="button" className={attendance === "yes" ? "selected" : ""} onClick={() => setAttendance("yes")}><span className="choice-dot"><Check size={14} /></span>Тийм, очно</button>
                  <button type="button" className={attendance === "no" ? "selected no" : ""} onClick={() => setAttendance("no")}><span className="choice-dot"><X size={14} /></span>Уучлаарай, очихгүй</button>
                </div>
              </fieldset>
              <div className={attendance === "yes" ? "guest-counts" : "guest-counts disabled-counts"}>
                <Counter label="Том хүн" hint="13 наснаас дээш" value={adults} onChange={setAdults} icon={<Users size={20} />} />
                <Counter label="Хүүхэд" hint="0–12 нас" value={children} onChange={setChildren} icon={<Baby size={20} />} />
              </div>
              <label className="field-label" htmlFor="note">Мэндчилгээ <span>(заавал биш)</span></label>
              <textarea id="note" name="note" placeholder="Тогтуунд зориулсан сайхан үгээ үлдээгээрэй…" maxLength={280} rows={3} />
              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="spin" size={19} /> : <Heart size={18} />}
                {isSubmitting ? "Хадгалж байна…" : "Хариугаа илгээх"}
              </button>
            </form>
          )}
        </section>

        <footer><div className="footer-one">1</div><p>Тогтуун · 2026</p><small>Таныг хайртайгаар хүлээж байна ♡</small></footer>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
