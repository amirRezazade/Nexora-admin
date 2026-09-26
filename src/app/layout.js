import { Inter, Vazirmatn } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/Provider";
import ThemeProvider, { themeScript } from "@/components/layout/ThemeProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { localeScript } from "@/i18n/script";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Nexora Admin",
    template: "%s · Nexora",
  },
  description: "Nexora is the admin platform for running an online store: catalog, orders, inventory, customers and analytics in one place.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e11" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${vazirmatn.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://akqrnvrgsnofnhrhlxow.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://akqrnvrgsnofnhrhlxow.supabase.co" />
      </head>
      <body>
        <StoreProvider>
          <ThemeProvider>
            <I18nProvider>
              <AppShell>{children}</AppShell>
            </I18nProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
