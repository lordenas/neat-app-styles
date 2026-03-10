import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

const RTL_LANGS = ["ar", "pes"];
const isBrowser = typeof window !== "undefined";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next);

  // Backend loading from /public/locales is only needed in browser runtime.
  if (isBrowser) {
    i18n.use(HttpBackend);
  }

  void i18n.init({
    ...(isBrowser
      ? {
          backend: {
            loadPath: "/locales/{{lng}}/common.json",
          },
        }
      : {}),
    ns: ["common"],
    defaultNS: "common",
    lng: "ru",
    fallbackLng: "ru",
    supportedLngs: ["ru", "en", "de", "fr", "es", "ar", "pes", "pl", "uk", "pt", "nl", "sv"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    resources: isBrowser
      ? undefined
      : {
          ru: {
            common: {},
          },
        },
  });
}

function syncDocumentLocale(lng: string) {
  if (typeof document === "undefined") return;

  const dir = RTL_LANGS.includes(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
}

i18n.on("languageChanged", (lng) => {
  syncDocumentLocale(lng);
});

syncDocumentLocale(i18n.language);

export default i18n;
