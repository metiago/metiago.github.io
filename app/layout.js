
import TopBar from "./components/TopBar";
import "./styles/globals.scss";
import Footer from './components/Footer';


export const metadata = {
  title: "Just Experiments",
  description: "A test under controlled conditions that is made to demonstrate a known truth, examine the validity of a hypothesis, or determine the efficacy of something previously untried.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <TopBar />
        <main id="main-content" className="site-main container">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
