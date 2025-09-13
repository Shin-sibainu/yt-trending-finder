import "./globals.css";

export const metadata = {
  title: "YouTube Trending Finder",
  description: "登録者比で“急上昇中”のYouTube動画を発見",
  openGraph: {
    title: "YouTube Trending Finder",
    description: "登録者比で“急上昇中”のYouTube動画を発見",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Trending Finder",
    description: "登録者比で“急上昇中”のYouTube動画を発見",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon.svg",
  },
} as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
