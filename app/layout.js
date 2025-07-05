import './globals.css'

export const metadata = {
  title: 'CaptionCroc - Snappy Captions That Bite!',
  description: 'Generate engaging social media captions in seconds with AI. Perfect for Instagram, Facebook, TikTok, and more.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
