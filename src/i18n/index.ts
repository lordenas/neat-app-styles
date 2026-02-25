import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

const RTL_LANGS = ["ar", "pes"];

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/common.json",
    },
    ns: ["common"],
    defaultNS: "common",
    lng: "ru",
    fallbackLng: "ru",
    supportedLngs: ["ru", "en", "de", "fr", "es", "ar", "pes", "pl", "uk", "pt", "nl", "sv"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

i18n.on("languageChanged", (lng) => {
  const dir = RTL_LANGS.includes(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
