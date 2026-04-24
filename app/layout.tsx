import type { Metadata, Viewport } from 'next' // Importado Viewport
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

// ADICIONADO: Configuração para layout menor (DPI alta) e bloqueio de zoom
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 0.95, // Ajustado para não ficar tão pequeno
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000', // Isso ataca a barra do Safari diretamente
  viewportFit: 'cover',   // ADICIONE ISSO: faz o app ocupar a tela toda
}

export const metadata: Metadata = {
  title: 'BindAI',
  description: 'Sua assistente de inteligência artificial para tecnologia, infraestrutura, cloud e segurança.',
  generator: 'BindIT',
  icons: {
    icon: [
      {
        url: '/ialogo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/iallogo.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/iallogo.png',
  },
  openGraph: {
    title: 'BindAI Core',
    description: 'Sua assistente de inteligência artificial especializada.',
    url: 'https://bindai.bindit.com.br',
    siteName: 'Bind IT',
    images: [
      {
        url: '/iallogo.png',
        width: 1200,
        height: 630,
        alt: 'BindAI Logo',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BindAI',
    description: 'Sua assistente de inteligência artificial especializada.',
    images: ['/iallogo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-transparent`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}