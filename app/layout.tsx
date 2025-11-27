import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABAP Visual Blueprints",
  description: "Minimal ABAP visual programming playground"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
