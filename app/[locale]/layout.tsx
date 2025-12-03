import { ReactNode } from "react";

export async function generateStaticParams() {
  // Don't pre-render locale-specific routes, let them be generated on-demand
  return [];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await params;
  return children;
}
