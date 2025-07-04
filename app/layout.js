export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://unpkg.com/tailwindcss@^3.0/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
