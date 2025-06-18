import { DerivProvider } from "@/contexts/DerivContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserProvider } from "@/contexts/UserContext";
import Cookie from "@/lib/Cookie";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import StyledComponentsRegistry from "@/lib/registry";
import ClientThemeProvider from "@/providers/ClientThemeProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Suspense } from "react";

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ReactQueryProvider>
        <StyledComponentsRegistry>
          <ClientThemeProvider>
            <SidebarProvider>
              <UserProvider>
                <DerivProvider>
                  {children}
                </DerivProvider>
              </UserProvider>
            </SidebarProvider>
            <Cookie />
          </ClientThemeProvider>
        </StyledComponentsRegistry>
      </ReactQueryProvider>
    </Suspense>
  );
}

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Bot Billions",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <GoogleAnalytics />
      <body className={archivo.variable}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}