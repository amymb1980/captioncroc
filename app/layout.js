export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* No CSS at all for testing */}
      </head>
      <body>{children}</body>
    </html>
  );
}
