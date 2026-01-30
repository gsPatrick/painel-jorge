import "./globals.css";

export const metadata = {
  title: "PrintShot Admin",
  description: "Administrative Panel for PrintShot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
