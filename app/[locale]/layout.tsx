import { ReactNode } from "react";
import { type Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  return children;
}
