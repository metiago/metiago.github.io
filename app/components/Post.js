"use client"
import { useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml'
import go from 'highlight.js/lib/languages/go'
import sql from 'highlight.js/lib/languages/sql'

import 'highlight.js/styles/github-dark.css';
import './Post.css'

hljs.registerLanguage('go', go);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('sql', sql);


const Post = ({ title, date, content, category, author }) => {

    useEffect(() => {
        import("bootstrap/dist/js/bootstrap");
        const blocks = document.querySelectorAll('pre code');
        blocks.forEach((block) => {
            hljs.highlightElement(block);
        });
    }, [])

    return (
        <article className="reading-width post-page">
            <header className="page-header">
                <p className="eyebrow">Just Experiments</p>
                <h1>{title}</h1>
                <div className="post-meta">
                    {date && <time dateTime={date}>{date}</time>}
                    {category && <span>{category}</span>}
                    {author && <span>{author}</span>}
                </div>
            </header>
            <div className="content" dangerouslySetInnerHTML={{ __html: content }} />
        </article>
    );
}

export default Post;
