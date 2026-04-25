import "./globals.css";

export const metadata = {
  title: "Shottelling Admin",
  description: "Administrative Panel for Shottelling",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
