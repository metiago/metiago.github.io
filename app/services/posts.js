import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), '/app/content/posts');

export async function getAllPosts() {
  
  const fileNames = await fs.promises.readdir(postsDirectory);

  const posts = await Promise.all(fileNames.map(async (fileName) => {
      const filePath = path.join(postsDirectory, fileName);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');

      const { data } = matter(fileContents);
      const slug = fileName.replace(/\.md$/, '');

      return {
        slug,
        ...data,
      };
    })
  );

  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return sortedPosts;
}

export async function getPostBySlug(slug) {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = await fs.promises.readFile(filePath, 'utf8');

  const { data, content } = matter(fileContents);
  return {
    slug,
    ...data,
    content,
  };
}
