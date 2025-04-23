import type { Metadata } from 'next'
import '@/styles/globals.css'
import React from 'react'
import blogMetaData from '@/metadata/blogMetaData'
import { LayoutMain } from './(layout)/(components)/layout-main'
import UiContextProvider from './(layout)/(components)/ui-context-provider'
import { Provider } from 'jotai'
import { SessionProvider } from './login/(components)/session-provider'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'

export const metadata: Metadata = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  metadataBase: new URL(blogMetaData.siteUrl),

  title: {
    default: blogMetaData.title,
    template: `%s | ${blogMetaData.title}`
  },
  description: blogMetaData.description,
  openGraph: {
    title: blogMetaData.title,
    description: blogMetaData.description,
    url: './',
    siteName: blogMetaData.title,
    images: [blogMetaData.socialBanner],
    locale: 'ko_KR',
    type: 'website'
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${blogMetaData.siteUrl}/feed.xml`
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  twitter: {
    title: blogMetaData.title,
    card: 'summary_large_image',
    images: [blogMetaData.socialBanner]
  }
}

export default function RootLayout ({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="ko">
    <body>
    <Provider>
      <GoogleTagManager gtmId={'GTM-PMH7MTKN'}/>
      <GoogleAnalytics gaId={'G-P4VL2DXGLB'}/>
      <UiContextProvider>
        <SessionProvider>
          <LayoutMain
            page={children}
          >
          </LayoutMain>
        </SessionProvider>
      </UiContextProvider>
    </Provider>
    <SpeedInsights/>
    </body>
    </html>
  )
}
