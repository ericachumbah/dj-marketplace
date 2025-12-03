"use client";

import dynamic from "next/dynamic";

export const revalidate = 0;

const AdminDashboard = dynamic(
  () => import("@/app/components/admin/Dashboard"),
  { ssr: false, loading: () => <div>Loading...</div> }
);

export default function AdminPage() {
  return <AdminDashboard />;
}
