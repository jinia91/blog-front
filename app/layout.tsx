import type { Metadata } from 'next'
import '@/styles/globals.css'
import React from 'react'
import blogMetaData from '@/metadata/blogMetaData'
import { LayoutMain } from './(layout)/(components)/layout-main'
import UiContextProvider from './(layout)/(components)/ui-context-provider'
import { Provider } from 'jotai'
import { SessionProvider } from './login/(components)/session-provider'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'

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
    <Script id="gtm-init" strategy="afterInteractive">
      {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
        `}
    </Script>
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      ></iframe>
    </noscript>
    <Provider>
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
