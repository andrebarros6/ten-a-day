import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { Streak, Tabs } from "@/components/chrome";
import { ThemeToggle } from "@/components/theme-toggle";
import { meta } from "@/lib/content";
import { m } from "@/lib/labels";
import { APP_URL, REPO_URL } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import "./globals.css";

// Fonts are downloaded at build time and served from this site, so visitors make no request to Google.
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "700"] });
const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  ...(APP_URL ? { metadataBase: new URL(APP_URL) } : {}),
  title: { default: meta.name + " · " + m.masthead.tagline, template: "%s · " + meta.name },
  description: m.masthead.sub,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="mx-auto max-w-[780px] px-[18px] pt-5 pb-14">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Link
                href="/"
                className="font-display text-[clamp(34px,9vw,52px)] leading-[1.12] font-bold tracking-[-0.02em] text-ink no-underline"
              >
                {meta.name}
              </Link>
              <p className="mt-1 font-display text-[clamp(17px,4.4vw,21px)] leading-snug font-medium text-ink">
                {m.masthead.tagline}
              </p>
              <p className="mt-1.5 max-w-[46ch] text-[15px] text-muted">{m.masthead.sub}</p>
            </div>
            <Streak />
          </header>

          <Tabs />

          <main>{children}</main>

          <footer className="mt-10 grid gap-3 border-t border-line pt-4">
            <p className="note max-w-[66ch]">{m.footer.disclaimer}</p>
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 text-sm">
              <span className="flex flex-wrap gap-x-4 gap-y-1">
                <Link href="/privacy/">{m.footer.privacy}</Link>
                <Link href="/terms/">{m.footer.terms}</Link>
                <a href={REPO_URL} target="_blank" rel="noopener">
                  {m.footer.source}
                </a>
              </span>
              <ThemeToggle />
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
