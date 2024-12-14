const fs = require('fs');
const path = require('path');

const blogDirectory = path.join(process.cwd(), 'app/content/posts');
const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

const mdxFilePaths = getAllMdxFilePaths(blogDirectory);
const sitemap = mdxFilePaths.map((filePath) => {
  const slug = path.basename(filePath, '.mdx');
  const url = `https://metiago.github.io/posts/${slug}`;
  return { url };
});

sitemap.push({
  url: 'https://metiago.github.io/',
});

const xml = generateSitemapXml(sitemap);
fs.writeFileSync(sitemapPath, xml);

function getAllMdxFilePaths(directory) {
  const fileNames = fs.readdirSync(directory);
  const filePaths = fileNames.map((fileName) => {
    const filePath = path.join(directory, fileName);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return getAllMdxFilePaths(filePath);
    } else {
      return filePath;
    }
  });

  return [].concat(...filePaths);
}

function generateSitemapXml(sitemap) {
  const urlset = sitemap
    .map(({ url }) => {
      return `
        <url>
          <loc>${url}</loc>
        </url>
      `;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlset}
  </urlset>`.trim();
}

console.log('Sitemap generated at:', sitemapPath);
