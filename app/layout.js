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
        
        {/* Multi-format favicon support */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#007B40" />
        <meta name="msapplication-TileColor" content="#007B40" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
