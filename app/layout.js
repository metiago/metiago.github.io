
import Container from "react-bootstrap/Container";
import TopBar from "./components/TopBar";
import "./styles/globals.scss";
import Footer from './components/Footer';


export const metadata = {
  title: "Tiago",
  description: "A test under controlled conditions that is made to demonstrate a known truth, examine the validity of a hypothesis, or determine the efficacy of something previously untried.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400&family=Montserrat:wght@700&family=Roboto:wght@400&display=swap"
          rel="stylesheet"
        />

      </head>
      <body>
        <TopBar />
        <Container fluid='md'>
          {children}
        </Container>
        <Footer />
      </body>
    </html>
  );
}
