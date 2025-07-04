export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'caption-orange': '#EA8953',
                  'caption-green': '#007B40'
                }
              }
            }
          }
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}
