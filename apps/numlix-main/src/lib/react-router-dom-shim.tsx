"use client";

import * as React from "react";
import Link from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

type ToValue = string;

function getLocalePrefix(pathname: string): { lang: string; country: string } {
  const parts = pathname.split("/").filter(Boolean);
  return {
    lang: parts[0] ?? "ru",
    country: parts[1] ?? "ru",
  };
}

function isExternalUrl(value: string): boolean {
  return /^(https?:\/\/|mailto:|tel:)/.test(value);
}

function toLocalizedPath(to: ToValue, pathname: string): string {
  if (!to || isExternalUrl(to) || to.startsWith("#")) return to;
  if (!to.startsWith("/")) return to;

  const { lang, country } = getLocalePrefix(pathname);
  const prefix = `/${lang}/${country}`;

  if (to === "/") return prefix;
  if (to.startsWith(prefix)) return to;

  return `${prefix}${to}`;
}

type LinkProps = React.PropsWithChildren<
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    to: string;
    replace?: boolean;
    prefetch?: boolean;
  }
>;

export function LinkShim({ to, replace, prefetch, children, ...rest }: LinkProps) {
  const pathname = usePathname();
  const href = toLocalizedPath(to, pathname);
  const NextLinkAny = Link as unknown as React.ComponentType<Record<string, unknown>>;
  return (
    <NextLinkAny href={href} replace={replace} prefetch={prefetch} {...(rest as Record<string, unknown>)}>
      {children as React.ReactNode}
    </NextLinkAny>
  );
}

export function useNavigate() {
  const router = useRouter();
  const pathname = usePathname();

  return React.useCallback(
    (to: string | number) => {
      if (typeof to === "number") {
        if (to < 0) router.back();
        return;
      }
      router.push(toLocalizedPath(to, pathname));
    },
    [pathname, router],
  );
}

export function useParams() {
  return useNextParams() as Record<string, string>;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | string) => void] {
  const params = useNextSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const setter = React.useCallback(
    (next: URLSearchParams | string) => {
      const value = typeof next === "string" ? next : next.toString();
      const suffix = value ? `?${value}` : "";
      router.push(`${pathname}${suffix}`);
    },
    [pathname, router],
  );

  return [new URLSearchParams(params.toString()), setter];
}

export function useLocation() {
  const pathname = usePathname();
  const search = useNextSearchParams().toString();
  return {
    pathname,
    search: search ? `?${search}` : "",
    hash: "",
  };
}

export function Navigate({ to, replace = true }: { to: string; replace?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  React.useEffect(() => {
    const href = toLocalizedPath(to, pathname);
    if (replace) router.replace(href);
    else router.push(href);
  }, [pathname, replace, router, to]);
  return null;
}

export function BrowserRouter({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function Routes({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function Route() {
  return null;
}

export { LinkShim as Link };
