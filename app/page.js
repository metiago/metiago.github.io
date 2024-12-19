import Link from 'next/link';
import { Col, Row } from 'react-bootstrap';
import { getAllPosts } from './services/posts.js';
import Search from './components/Search';

export default async function Home() {
  const posts = (await getAllPosts()).filter(p => !p?.draft);
  return (
    <div>
      <div className="d-flex justify-content-center">
        <article className="w-75 max-w-sm mx-auto">
          <header className="mb-10 text-left">
            <h6><Search /></h6>
          </header>
          {posts.map((post, i) => (
            <div key={i}>
              <Link href={`/posts/${post.slug}`} className="text-decoration-none">
                <h5 className="card-title">{post.title}</h5>
              </Link>
              <hr />
            </div>
          ))}
        </article>
      </div>
    </div>
  );
}
