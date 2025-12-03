import AdminDashboard from "@/app/components/admin/Dashboard";

export function generateStaticParams() {
  return [];
}

export default function AdminPage() {
  return <AdminDashboard />;
}
