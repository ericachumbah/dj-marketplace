import dynamic from "next/dynamic";

const AdminDashboard = dynamic(
  () => import("@/app/components/admin/Dashboard"),
  { ssr: false }
);

export default function AdminPage() {
  return <AdminDashboard />;
}
