export default function Ebook() {
  return (
    <div>
      <div className="d-flex justify-content-center">
        <article className="w-75 max-w-sm mx-auto px-4 py-5 text-left">
          <header className="mb-4 text-center">
            <h1 className="display-4">Ebooks</h1>
            <p className="lead">Compartilhando alguns conhecimentos de programação pelos meus e-books!</p>
          </header>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Princípios de Programação</h6>
                  <p className="card-text">Downloads: <strong>43,350</strong></p>
                  <a
                    href="/files/principios-de-programacao-book.pdf"
                    download
                    className="card-link"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Proteção de Dados com Java</h6>
                  <p className="card-text">Downloads: <strong>37,756</strong></p>
                  <a
                    href="/files/proteção-de-dados-com-java-book.pdf"
                    download
                    className="card-link"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Segurança da Informação com Java</h6>
                  <p className="card-text">Downloads: <strong>33,987</strong></p>
                  <a
                    href="/files/seguranca-da-informacao-com-java-book.pdf"
                    download
                    className="card-link"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
