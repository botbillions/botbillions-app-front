
import type { Metadata } from "next";
import { Archivo } from "next/font/google";

import StyledComponentsRegistry from "@/lib/registry";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import Cookie from "@/lib/Cookie";
import ClientThemeProvider from "@/providers/ClientThemeProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Bot Billions",
  description: "",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <html lang="pt-br">
      <GoogleAnalytics />
      <body className={archivo.variable}>
        <ReactQueryProvider>
          <StyledComponentsRegistry>
            <ClientThemeProvider>
              <SidebarProvider>
              {children}
              </SidebarProvider>
              <Cookie />
            </ClientThemeProvider>
          </StyledComponentsRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
