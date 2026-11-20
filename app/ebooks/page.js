export default function Ebook() {
  return (
    <article className="reading-width ebooks-page">
      <header className="page-header">        
        <h1>eBooks</h1>
      </header>
      <ul className="resource-list">
        <li>
          <h2>Princípios de Programação</h2>
          <a href="/files/principios-de-programacao-book.pdf" download>Download PDF</a>
        </li>
        <li>
          <h2>Proteção de Dados com Java</h2>
          <a href="/files/proteção-de-dados-com-java-book.pdf" download>Download PDF</a>
        </li>
        <li>
          <h2>Segurança da Informação com Java</h2>
          <a href="/files/seguranca-da-informacao-com-java-book.pdf" download>Download PDF</a>
        </li>
      </ul>
    </article>
  );
}
