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
            <Col xs={12} sm={6} md={4} key={post.slug} className='mt-3'>
              <div className='card'>
                <Image src={post?.image} className="card-img-top" />
                <div className="card-body">
                  <Link href={`/posts/${post.slug}`} className="text-decoration-none">
                    <h5 className="card-title">{post.title}</h5>
                  </Link>
                  <h6 className="card-subtitle mb-2 text-muted">{post.date}</h6>
                  <p className="card-text">{post.excerpt}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Col>      
    </Row>
  );
}
