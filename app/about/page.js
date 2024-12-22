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
            <Image src="/images/profile/me.png" alt="me" className="img-fluid rounded-circle" width={140}/>
          </div>
          <div>
            <p>
             
            </p>
            <p>
             
            </p>
            <p>
            
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
