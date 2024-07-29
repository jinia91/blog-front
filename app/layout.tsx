import type { Metadata } from 'next'
import '@/styles/globals.css'
import React from 'react'
import blogMetaData from '@/metadata/blogMetaData'
import { TapMain } from '@/components/ui-layout/tap_system/TapMain'
import UiContextProvider from '@/components/system/UiContextProvider'
import { Provider } from 'jotai'
import { ContextInitializer } from '@/components/ContextInitializer'

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
    <head></head>
    <body className="overflow-hidden">
    <Provider>
      <UiContextProvider>
        <ContextInitializer>
          <TapMain
            page={children}
          >
          </TapMain>
        </ContextInitializer>
      </UiContextProvider>
    </Provider>
    </body>
    </html>
  )
}
