import { Image } from "react-bootstrap";

export default function About() {
  return (
    <div>
      <div className="d-flex justify-content-center">
        <article className="w-75 max-w-sm mx-auto">
          <header className="mb-10 text-center">
            <h1>About Me</h1>
          </header>
          <div className="text-center mb-4">
            <Image 
              src="images/metiago.png"
              alt="A photo of Tiago"
              className="img-fluid"
            />
          </div>
          <div>
            <p>
              👋 Hi, I’m Tiago, a passionate software engineer with a love for coding and technology. 
              With a strong background in web-based systems, I’m constantly exploring new technologies and conducting experiments to expand my knowledge.
            </p>
            <p>
              This blog serves as my platform to document those experiments, share prototypes, 
              and discuss the latest trends in software development.
            </p>
            <p>
              Happy researching!
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
