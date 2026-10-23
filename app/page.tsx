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
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Attendance = "yes" | "no";

const EVENT_DATE = new Date("2026-11-06T16:30:00+08:00");

function getCountdown() {
  const difference = Math.max(0, EVENT_DATE.getTime() - Date.now());
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

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

function PartyConfetti({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "party-confetti compact" : "party-confetti"} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => <i key={index} />)}
      {!compact && (
        <>
          <svg className="party-illustration gift" viewBox="0 0 90 82">
            <path fill="#ffc864" d="M12 23h67v52H12z" />
            <path fill="#2389ed" d="M38 23h14v52H38zM8 16h74v14H8z" />
            <path d="M45 18C26-7 19 11 29 19m16-1C62-8 74 7 58 21" fill="none" stroke="#2389ed" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <svg className="party-illustration horn" viewBox="0 0 78 88">
            <path d="M14 69 61 20 71 78Z" fill="#ffd25f" />
            <path d="m26 57 14-14 24 5 4 17Z" fill="#f35d9b" />
            <path d="M13 69c-8 5-7 13 3 14m-2-14c-1-9-7-12-12-9" fill="none" stroke="#f35d9b" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <svg className="party-illustration cupcake" viewBox="0 0 82 92">
            <path d="M17 45h49l-7 39H24Z" fill="#fff2df" stroke="#eac9a5" strokeWidth="2" />
            <path d="M27 47v34m12-34v36m12-36v34" stroke="#b47748" strokeWidth="4" />
            <path d="M18 47c-3-14 8-17 14-15 0-10 17-14 23-3 12-1 17 8 11 18Z" fill="#f0f7ff" />
            <path d="M43 31V13" stroke="#2389ed" strokeWidth="6" strokeLinecap="round" /><path d="m43 14 8-8" stroke="#ffc864" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <svg className="party-illustration flower" viewBox="0 0 76 76">
            <g fill="#df3d97" stroke="#f18ac2" strokeWidth="2">
              <ellipse cx="38" cy="17" rx="11" ry="18" /><ellipse cx="38" cy="59" rx="11" ry="18" />
              <ellipse cx="17" cy="38" rx="18" ry="11" /><ellipse cx="59" cy="38" rx="18" ry="11" />
              <ellipse cx="23" cy="23" rx="11" ry="17" transform="rotate(-45 23 23)" /><ellipse cx="53" cy="53" rx="11" ry="17" transform="rotate(-45 53 53)" />
              <ellipse cx="53" cy="23" rx="11" ry="17" transform="rotate(45 53 23)" /><ellipse cx="23" cy="53" rx="11" ry="17" transform="rotate(45 23 53)" />
            </g>
            <circle cx="38" cy="38" r="10" fill="#bc2780" />
          </svg>
          <svg className="party-illustration streamer" viewBox="0 0 90 150">
            <path d="M13 7c69 18-18 44 44 66s-39 40 8 70" fill="none" stroke="#9b68ef" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(getCountdown);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (!opened) return;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [opened, submitted]);

  function openInvitation() {
    if (isOpening) return;
    setIsOpening(true);
    window.setTimeout(() => setOpened(true), 1400);
  }

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
          note: "",
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

  return (
    <main className={opened ? "site invitation-open" : isOpening ? "site invitation-opening" : "site"}>
      <div className="paper-noise" aria-hidden="true" />

      {!opened && (
        <section className="opening-screen" aria-label="Урилгаа нээх">
          <div className="opening-orbit orbit-one" />
          <div className="opening-orbit orbit-two" />
          <div className="envelope-wrap">
            <div className="tiny-stars" aria-hidden="true">✦ · ✧ · ✦</div>
            <div className="envelope">
              <div className="envelope-back" />
              <div className="envelope-flap" aria-hidden="true" />
              <div className="letter-preview">
                <Baby size={24} />
                <strong>Тогтуун</strong>
                <span>нэг нас</span>
              </div>
              <div className="envelope-front" />
              <button
                type="button"
                className="wax-seal"
                onClick={openInvitation}
                disabled={isOpening}
                aria-label="Урилгаа нээж цааш шилжих"
              >
                <span>1</span>
              </button>
            </div>
            <p className="opening-date">2026 · 11 · 06</p>
          </div>
        </section>
      )}

      <div className="invitation-content">
        <section className="hero" id="top">
          <PartyConfetti />
          <div className="balloon balloon-peach" aria-hidden="true"><span /></div>
          <div className="balloon balloon-blue" aria-hidden="true"><span /></div>
          <div className="hero-copy reveal reveal-1">
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
          <PartyConfetti compact />
          <div className="ornament-divider scroll-reveal" data-scroll-reveal><span>◆</span></div>
          <h2 className="scroll-reveal" data-scroll-reveal>Тогтууны анхны<br /><em>төрсөн өдөр</em></h2>

          <div className="calendar-card scroll-reveal" data-scroll-reveal aria-label="2026 оны 11 дүгээр сарын календарь">
            <div className="calendar-top"><span>11 САР</span><strong>2026</strong></div>
            <div className="calendar-weekdays">
              {['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="calendar-days">
              {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => (
                <span key={day} className={day === 6 ? "selected-day" : ""}>{day}</span>
              ))}
            </div>
            <div className="calendar-caption"><CalendarDays size={18} /> Баасан гараг · 16:30 цаг</div>
          </div>

          <div className="countdown-wrap scroll-reveal" data-scroll-reveal>
            <p>БОЛОХ ХҮРТЭЛ</p>
            <div className="countdown-grid" aria-label="Төрсөн өдөр хүртэлх хугацаа">
              <div><strong>{countdown.days}</strong><span>ӨДӨР</span></div>
              <div><strong>{String(countdown.hours).padStart(2, '0')}</strong><span>ЦАГ</span></div>
              <div><strong>{String(countdown.minutes).padStart(2, '0')}</strong><span>МИНУТ</span></div>
              <div><strong>{String(countdown.seconds).padStart(2, '0')}</strong><span>СЕКУНД</span></div>
            </div>
          </div>

          <div className="location-card scroll-reveal" data-scroll-reveal>
            <span className="info-icon"><MapPin size={22} /></span>
            <p>ХААНА</p>
            <h3>Koko Kids House</h3>
            <address>Зайсан, Богд уулын энгэрт<br />Хан Голомт Резиденс<br />Club House-н 1 давхар</address>
            <a href="https://www.google.com/maps/search/?api=1&query=Koko+Kids+House+Zaisan+Khan+Golomt+Residence+Ulaanbaatar" target="_blank" rel="noreferrer">
              <MapPin size={17} /> Зам заалгах
            </a>
          </div>
          <div className="ornament-divider bottom scroll-reveal" data-scroll-reveal><span>◆</span></div>
        </section>

        <section className="memory-section">
          <PartyConfetti compact />
          <div className="memory-copy scroll-reveal" data-scroll-reveal>
            <h2>Инээд, хайр,<br /><em>бяцхан гайхамшиг</em></h2>
            <p>Тогтууны анхны төрсөн өдрийн дурсамжид таны инээмсэглэл хамгийн нандин бэлэг байх болно.</p>
          </div>
          <div className="doodle-line scroll-reveal" data-scroll-reveal aria-hidden="true" />
        </section>

        <section className="rsvp-section" id="rsvp">
          <PartyConfetti compact />
          <div className="rsvp-heading scroll-reveal" data-scroll-reveal>
            <h2>{submitted ? "Хариу ирлээ!" : "Ирэх эсэхээ доорх хэсгээр мэдэгдээрэй."}</h2>
            {submitted && <p>Баярлалаа. Таны хариуг амжилттай хадгаллаа.</p>}
          </div>

          {submitted ? (
            <div className="success-card scroll-reveal" data-scroll-reveal role="status">
              <Confetti />
              <div className="success-check"><Check size={34} strokeWidth={2.2} /></div>
              <h3>{attendance === "yes" ? "Тантай уулзахыг тэсэн ядан хүлээж байна!" : "Хариу өгсөнд баярлалаа"}</h3>
              <p>{attendance === "yes" ? `${adults} том хүн${children ? `, ${children} хүүхэд` : ""} ирэхээр бүртгэгдлээ.` : "Энэ удаа хамт байж чадахгүй ч таны сайхан ерөөл бидэнтэй хамт байна."}</p>
              <button onClick={() => setSubmitted(false)}>Хариугаа өөрчлөх</button>
            </div>
          ) : (
            <form className="rsvp-card scroll-reveal" data-scroll-reveal onSubmit={submitRsvp}>
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
                <Counter label="Хүүхэд" hint="3–12 нас" value={children} onChange={setChildren} icon={<Baby size={20} />} />
              </div>
              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="spin" size={19} /> : <Heart size={18} />}
                {isSubmitting ? "Хадгалж байна…" : "Хариугаа илгээх"}
              </button>
            </form>
          )}
        </section>

      </div>

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
