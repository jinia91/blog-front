import type {Metadata} from 'next'
import '../../styles/globals.css'
import React from "react";
import TopNav from "@/components/TopNav";
import blogMetaData from "@/static/blogMetaData";
import UiContext from "@/components/ui-context/UiContext";
import {DynamicLayout} from "@/components/ui-context/SideBarContext";
import Sidebar from "@/components/SideBar";


export const metadata: Metadata = {
  metadataBase: new URL(blogMetaData.siteUrl),
  title: {
    default: blogMetaData.title,
    template: `%s | ${blogMetaData.title}`,
  },
  description: blogMetaData.description,
  openGraph: {
    title: blogMetaData.title,
    description: blogMetaData.description,
    url: './',
    siteName: blogMetaData.title,
    images: [blogMetaData.socialBanner],
    locale: 'ko_KR',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${blogMetaData.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: blogMetaData.title,
    card: 'summary_large_image',
    images: [blogMetaData.socialBanner],
  },
}

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="ko">
    <head></head>
    <body>
    {/*실제 마크업 시작*/}
    <UiContext>
      <section className="flex flex-col h-screen">
          <DynamicLayout topNav={<TopNav/>} main={children} sideBar={<Sidebar/>}>
          </DynamicLayout>
      </section>
    </UiContext>
    </body>
    </html>
  )
}
