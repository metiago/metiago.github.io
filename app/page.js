import Link from 'next/link';
import { Col, Row } from 'react-bootstrap';
import { getAllPosts } from './services/posts.js';
import Search from './components/Search';

export default async function Home() {
  const posts = (await getAllPosts()).filter(p => !p?.draft);
  return (
    <Row>      
      <Col xs={12} md={12}>
        <Row>
          <Search/>
          {posts.map((post, i) => (
            <div key={i}>
              <Link href={`/posts/${post.slug}`} className="text-decoration-none">
                <h5 className="card-title">{post.title}</h5>
              </Link>
              <hr />
            </div>
          ))}
        </Row>
      </Col>
    </Row>
  );
}
