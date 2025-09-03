import './globals.css'

export const metadata = {
  title: 'Flappy Bird Game',
  description: 'Classic Flappy Bird game built with Next.js, TypeScript, and HTML5 Canvas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}