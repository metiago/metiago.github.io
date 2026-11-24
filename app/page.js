import Link from 'next/link';
import Search from './components/Search';
import { getAllPosts } from './services/posts.js';

export default async function Home() {
  const posts = (await getAllPosts()).filter(p => !p?.draft);
  return (
    <div className="reading-width home-page">
      <header className="page-header">
        <p className="eyebrow">Lab Notes</p>
        <h1>Experiments &amp; Prototypes</h1>
        <p className="page-lead">A collection of technical findings, research logs, and builds in progress.</p>
      </header>
      {posts.length > 0 && (
        <section className="home-search" aria-label="Search articles">
          <Search />
        </section>
      )}
      <section className="article-list" aria-label="Articles">
        {posts.length === 0 && <p className="article-list-item text-body-secondary mb-0">No posts available yet.</p>}
        {posts.map((post) => (
          <article key={post.slug} className="article-list-item">
            {post.date && <time className="article-date" dateTime={post.date}>{post.date}</time>}
            <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
            {post.excerpt && <p>{post.excerpt}</p>}
          </article>
        ))}
      </section>
    </div>
  );
}
