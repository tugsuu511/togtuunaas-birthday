import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ирцийн хариу · Тогтууны төрсөн өдөр",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
