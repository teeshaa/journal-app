import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta"
});

const serif = DM_Serif_Display({ 
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: "Next Iteration - Your Leadership Growth Journal",
  description: "Transform your leadership journey with thoughtful reflection. A sophisticated digital journal for tech leaders who embrace continuous growth.",
  keywords: ["leadership journal", "tech leadership", "professional growth", "reflection", "continuous improvement", "leadership development"],
  authors: [{ name: "Next Iteration" }],
  openGraph: {
    title: "Next Iteration - Your Leadership Growth Journal",
    description: "Transform your leadership journey with thoughtful reflection. A sophisticated digital journal for tech leaders who embrace continuous growth.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${serif.variable}`}>
      <body className="font-sans antialiased noise-bg">
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              boxShadow: 'var(--shadow-lg)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
