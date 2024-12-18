import { Col, Row, Image } from 'react-bootstrap';
import { getAllPosts } from './services/posts';
import Link from 'next/link';

export default async function Home() {
  const posts = (await getAllPosts()).filter(p => !p?.draft);
  return (
    <Row>
      <Col xs={12} md={12}>
        <Row>
          {posts.map((post) => (
            <div>
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
