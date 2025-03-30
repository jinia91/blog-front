module.exports = {
  siteUrl: 'https://jiniaslog.co.kr',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  outDir: './public',
  exclude: ['/login/oauth2/code/google', '/memo', '/empty'],
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
