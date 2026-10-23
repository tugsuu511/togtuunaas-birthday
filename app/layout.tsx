import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Т.Тогтуун — 1 насны төрсөн өдрийн урилга",
  description: "2026.11.06 · Тогтууны анхны төрсөн өдрийн баярт урьж байна.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Т.Тогтуун нэг нас хүрлээ!",
    description: "Бидний бяцхан баярыг хамтдаа тэмдэглэцгээе · 2026.11.06",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}
