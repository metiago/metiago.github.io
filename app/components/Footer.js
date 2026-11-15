import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="site-footer">
      <Container>
        <p>&copy; {new Date().getFullYear()} Tiago Souza. All rights reserved.</p>
      </Container>
    </footer>
  );
};

export default Footer;
