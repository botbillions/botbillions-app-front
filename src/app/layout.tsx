
import type { Metadata } from "next";
import { Archivo } from "next/font/google";

import { DerivProvider } from "@/contexts/DerivContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserProvider } from "@/contexts/UserContext";
import Cookie from "@/lib/Cookie";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import StyledComponentsRegistry from "@/lib/registry";
import ClientThemeProvider from "@/providers/ClientThemeProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

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
      </body>
    </html>
  );
};

export default RootLayout;
