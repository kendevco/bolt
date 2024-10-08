import { env } from '@env'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'

import '@/app/(app)/globals.css'
import GoogleAdSense from '@/components/GoogleAdSense'
import Provider from '@/trpc/Provider'
import { serverClient } from '@/trpc/serverClient'

export async function generateMetadata(): Promise<Metadata> {
  try {
    // calling the site-settings to get all the data
    const metadata = await serverClient.siteSettings.getSiteSettings()
    const generalSettings = metadata.general

    const ogImageUrl =
      typeof generalSettings.ogImageUrl === 'string'
        ? generalSettings.ogImageUrl
        : generalSettings.ogImageUrl?.url!

    const title = {
      default: generalSettings.title,
      template: `%s | ${generalSettings.title}`,
    }

    const description = generalSettings.description
    const ogImage = [
      {
        url: ogImageUrl,
        height: 630,
        width: 1200,
        alt: `og image`,
      },
    ]

    console.log(env.NEXT_PUBLIC_PUBLIC_URL, { ogImageUrl })

    return {
      title,
      description,
      // we're appending the http|https int the env variable
      metadataBase: env.NEXT_PUBLIC_PUBLIC_URL as unknown as URL,
      openGraph: {
        title,
        description,
        images: ogImage,
      },
      twitter: {
        title,
        description,
        images: ogImage,
      },
      keywords: generalSettings.keywords,
    }
  } catch (error) {
    // in error case returning a base metadata object
    return {
      title: 'Create CQL App',
      description: 'Generated by create cql app',
    }
  }
}

export const viewport: Viewport = {
  themeColor: 'dark',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const metadata = await serverClient.siteSettings.getSiteSettings()
  const generalSettings = metadata.general

  const faviconUrl =
    typeof generalSettings?.faviconUrl === 'string'
      ? generalSettings?.faviconUrl
      : generalSettings?.faviconUrl?.url!

  return (
    <html lang='en' className='dark'>
      <head>
        {/* added a explicit link tag because favicon is coming from site-settings */}
        <link rel='icon' type='image/x-icon' href={faviconUrl} />
      </head>
      <body
        className={`${GeistSans.className} ${GeistMono.variable} antialiased`}>
        <Provider>{children}</Provider>

        {/* Sonnar toast library */}
        <Toaster richColors theme='dark' />

        {/* added google-adSense  */}
        <GoogleAdSense adSenseId={metadata.monetization?.adSenseId ?? ''} />
      </body>
    </html>
  )
}
