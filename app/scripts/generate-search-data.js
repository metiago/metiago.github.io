const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const outputFilePath = path.join(process.cwd(), 'public/search-data.json');

const postsDirectory = path.join(process.cwd(), '/app/content/posts');

async function getAllPosts() {

  const fileNames = await fs.promises.readdir(postsDirectory);

  const posts = await Promise.all(fileNames.map(async (fileName) => {
    const filePath = path.join(postsDirectory, fileName);
    const fileContents = await fs.promises.readFile(filePath, 'utf8');

    const { data } = matter(fileContents);
    const slug = fileName.replace(/\.md$/, '');

    return {
      id: null,
      slug,
      ...data,
    };
  })
  );

  const postsWithIds = posts.map((post, index) => ({
    ...post,
    id: index + 1,
  }));

  const sortedPosts = postsWithIds.sort((a, b) => new Date(b.date) - new Date(a.date));

  return sortedPosts;
}

async function generateSearchData() {
  try {
    const posts = await getAllPosts();

    await fs.promises.writeFile(outputFilePath, JSON.stringify(posts, null, 2));
    console.log(`Search data generated at ${outputFilePath}`);
  } catch (error) {
    console.error('Error generating search data:', error);
  }
}

generateSearchData();
