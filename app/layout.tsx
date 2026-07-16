import type { Metadata } from "next";
import "@fontsource-variable/manrope/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Grasp — Make developer concepts click",
    template: "%s · Grasp",
  },
  description: "Turn developer concepts into live, manipulable explanations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
