import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '回声 Echo — 很多陌生人，正在面对同一片海',
  description: '一个关于海、痕迹、时间与共同在场的 3D 网页互动艺术作品。',
  openGraph: {
    title: '回声 Echo',
    description: '很多陌生人，正在面对同一片海。',
    type: 'website',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: '回声 Echo 黄昏海岸' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '回声 Echo',
    description: '很多陌生人，正在面对同一片海。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
