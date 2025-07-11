export default function Ebook() {
  return (
    <div>
      <div className="d-flex justify-content-center">
        <article className="w-75 max-w-sm mx-auto">
          <header className="mb-10 text-center">
            <h1>eBooks</h1>
          </header>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Princípios de Programação</h6>
                  
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
