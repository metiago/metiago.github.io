"use client";

import { useEffect, useState } from "react";
import lunr from "lunr";
import Link from "next/link";
import { Col, Row } from "react-bootstrap";

const Search = () => {
  const [documents, setDocuments] = useState([]);
  const [index, setIndex] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {

    const fetchDocuments = async () => {
      try {
        const response = await fetch("/search-data.json");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setDocuments(data);

        const lunrIndex = lunr(function () {
          this.ref("id");
          this.field("title");
          this.field("content");

          data.forEach((doc) => {
            this.add(doc);
          });
        });

        setIndex(lunrIndex);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  const handleSearch = (event) => {
    const searchQuery = event.target.value;
    setQuery(searchQuery);

    if (index) {
      const searchResults = index.search(searchQuery);
      const resultDocs = searchResults.map((result) =>
        documents.find((doc) => doc.id === parseInt(result.ref))
      );
      setResults(resultDocs);
    } else {
      setResults([]);
    }
  };

  return (
    <>
      <Row>
        <Col>
          <input type="text" value={query} onChange={handleSearch} placeholder="Search..." className="form-control" />
        </Col>
      </Row>
      <div id="results">
        {results.length > 0 && (
          results.map((doc) => (
            <Row key={doc.id} className="mt-4">
              <Col>
                <Link href={`/posts/${doc.slug}`} className="text-decoration-none">
                  <div className="mb-2">{doc.title}</div>
                </Link>
              </Col>
            </Row>
          ))
        )}
      </div>
    </>
  );
};

export default Search;
