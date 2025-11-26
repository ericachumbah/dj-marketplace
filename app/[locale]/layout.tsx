import { ReactNode } from "react";
import { type Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return children;
}
