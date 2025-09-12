import './globals.css';

export const metadata = {
  title: "YT Trending Finder (MVP)",
  description: "Find trending YouTube videos with high VSR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
