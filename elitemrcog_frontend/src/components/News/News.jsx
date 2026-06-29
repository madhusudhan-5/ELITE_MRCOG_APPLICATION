import React from 'react';
import './News.css';

const articles = [
    {
        id: 1,
        tag: 'NEWS',
        title: 'Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution',
        excerpt: 'Class, launched less than a year ago by Blackboard co-founder Deepika, integrates exclusively...',
        image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80',
        large: true,
        link: '#',
    },
    {
        id: 2,
        tag: 'PRESS RELEASE',
        tagColor: 'teal',
        title: 'Class Technologies Inc. Closes $30 Million Series A Financing to Meet High Demand',
        excerpt: 'Class Technologies Inc., the company that created Class,...',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
        link: '#',
    },
    {
        id: 3,
        tag: 'NEWS',
        title: "Zoom's earliest investors are betting millions on a better Zoom for schools",
        excerpt: "Zoom was never created to be a consumer product. Nonetheless, the...",
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
        link: '#',
    },
    {
        id: 4,
        tag: 'NEWS',
        title: 'Former Blackboard CEO Raises $16M to Bring LMS Features to Zoom Classrooms',
        excerpt: 'This year, investors have reaped big financial returns from betting on Zoom...',
        image: 'https://images.unsplash.com/photo-1587731556938-38755b4803a6?w=400&q=80',
        link: '#',
    },
];

const News = () => {
    return (
        <section className="news section" id="news">
            <div className="container">
                <h2 className="section-heading">
                    Lastest <span className="highlight-navy">News and Resources</span>
                </h2>
                <p className="section-subheading">
                    See the developments that have occurred to <strong>Elite MRCOG</strong> in the world
                </p>

                <div className="news__grid">
                    {/* Large featured article */}
                    <div className="news__article news__article--large">
                        <div className="news__img-wrap">
                            <img src={articles[0].image} alt={articles[0].title} className="news__img" />
                        </div>
                        <span className="news__tag">{articles[0].tag}</span>
                        <h3 className="news__title">{articles[0].title}</h3>
                        <p className="news__excerpt">{articles[0].excerpt}</p>
                        <a href={articles[0].link} className="news__read-more">Read more</a>
                    </div>

                    {/* Right column — 3 smaller */}
                    <div className="news__sidebar">
                        {articles.slice(1).map((art) => (
                            <div className="news__article news__article--small" key={art.id}>
                                <div className="news__small-wrap">
                                    <div className="news__small-img-wrap">
                                        <img src={art.image} alt={art.title} className="news__small-img" />
                                        <span className={`news__tag news__tag--overlay${art.tagColor === 'teal' ? ' news__tag--press' : ''}`}>
                                            {art.tag}
                                        </span>
                                    </div>
                                    <div className="news__small-content">
                                        <h3 className="news__small-title">{art.title}</h3>
                                        <p className="news__excerpt">{art.excerpt}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default News;
