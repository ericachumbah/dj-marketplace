import { ReactNode } from "react";

export async function generateStaticParams() {
  // Generate static pages for default locales
  // Other locales will be generated on-demand
  return [{ locale: "en" }, { locale: "fr" }];
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
