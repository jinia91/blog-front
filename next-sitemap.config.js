module.exports = {
  siteUrl: 'https://jiniaslog.co.kr',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  outDir: './public',
  robotsTxtOptions: {
    policies: [
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: ['/blog', '/about'],
        disallow: '/',
      }
    ]
  }
}
