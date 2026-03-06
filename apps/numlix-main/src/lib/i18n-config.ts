export const supportedLanguages = ["ru"] as const;
export const supportedCountries = ["ru"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
export type SupportedCountry = (typeof supportedCountries)[number];

export const defaultLanguage: SupportedLanguage = "ru";
export const defaultCountry: SupportedCountry = "ru";

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage);
}

export function isSupportedCountry(value: string): value is SupportedCountry {
  return supportedCountries.includes(value as SupportedCountry);
}
