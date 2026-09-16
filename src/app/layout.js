import "./globals.css";
import StoreProvider from "@/store/Provider";
import ThemeProvider, { themeScript } from "@/components/layout/ThemeProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { localeScript } from "@/i18n/script";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: {
    default: "Nexora | Admin",
    template: "%s · Nova",
  },
  description: "Nova is the admin platform for running an online store: catalog, orders, inventory, customers and analytics in one place.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
