export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com/3.3.0"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
