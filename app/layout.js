import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import { AuthProvider } from "./Auth";

export const metadata = {
  title: "ClassMaster",
  description: "easy way to manage your class!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
