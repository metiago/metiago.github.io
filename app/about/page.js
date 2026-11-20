import { Image } from "react-bootstrap";

export default function About() {
  return (
    <article className="reading-width about-page">          
          <div className="text-center mb-4">
            <Image src="/images/profile/me.png" alt="me" className="img-fluid rounded-circle" width={140}/>
          </div>
          <div>
            <p>
              Hi there! My name&apos;s Tiago. I&apos;m a seasoned software engineer passionate about creating effective and efficient software solutions.
              I have developed a passion for designing and building scalable, efficient, and reliable enterprise applications.
              My journey in software development began with a technical certificate in computer programming, 
              where I gained a solid understanding of programming fundamentals, data structures, and algorithms.
              Throughout my career, I have worked on various Java-based projects, from small-scale web applications 
              to large-scale enterprise systems. 
            </p>
            <p>
              This site is called Just Experiments, and it&apos;s all about research and prototyping documentation.
            </p>
          </div>
    </article>
  );
}
