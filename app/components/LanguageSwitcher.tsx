"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { type Locale, getLocaleFlagEmoji, getLocaleDisplayName } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

const LOCALES: Locale[] = ["en", "fr"];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Extract current locale from pathname (e.g., /en/... or /fr/...)
  const currentLocale = (pathname.split("/")[1] as Locale) || "en";

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Replace current locale in path with new locale
    let newPathname = pathname;
    if (pathname.startsWith(`/${currentLocale}`)) {
      newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    } else {
      newPathname = `/${newLocale}${pathname}`;
    }

    router.push(newPathname);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        aria-label="Change language"
      >
        <span className="text-lg">{getLocaleFlagEmoji(currentLocale)}</span>
        <span className="hidden sm:inline">{currentLocale.toUpperCase()}</span>
        <ChevronDown className="w-4 h-4 transition-transform" style={{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {LOCALES.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full text-left px-4 py-2 flex items-center gap-3 transition ${
                  locale === currentLocale
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{getLocaleFlagEmoji(locale)}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{getLocaleDisplayName(locale)}</span>
                  <span className="text-xs text-gray-500">{locale.toUpperCase()}</span>
                </div>
                {locale === currentLocale && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
