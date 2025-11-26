import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

export type Locale = "en" | "fr";

const translations: Record<Locale, typeof en> = {
  en,
  fr,
};

export function getTranslations(locale: Locale = "en") {
  return translations[locale] || translations.en;
}

export function getLocaleDisplayName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: "English",
    fr: "Français",
  };
  return names[locale];
}

export function getLocaleFlagEmoji(locale: Locale): string {
  const flags: Record<Locale, string> = {
    en: "🇬🇧",
    fr: "🇫🇷",
  };
  return flags[locale];
}
