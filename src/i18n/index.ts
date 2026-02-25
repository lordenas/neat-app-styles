import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

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

export default i18n;
