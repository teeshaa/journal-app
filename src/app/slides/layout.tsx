import { Plus_Jakarta_Sans } from "next/font/google";
import "./slides.css";

const presentationFont = Plus_Jakarta_Sans({
  variable: "--font-presentation",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function SlidesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${presentationFont.variable} slides-page h-screen overflow-hidden`}>
      {children}
    </div>
  );
}
