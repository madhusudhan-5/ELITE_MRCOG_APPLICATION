import React from 'react';
import './News.css';
import featuredNewsImg from '../../assets/images/newimage.png';
import newsImg1 from '../../assets/images/newsimage1.png';
import newsImg2 from '../../assets/images/newsimage2.png';
import newsImg3 from '../../assets/images/newsimage3.png';

const articles = [
    {
        id: 1,
        tag: 'NEWS',
        title: 'Never Miss an Update from Elite MRCOG',
        excerpt: 'Discover the latest mentor videos, newly added recall stations, free webinar announcements, podcasts, and platform updates designed to keep your MRCOG Part 3 preparation on track.',
        image: featuredNewsImg,
        large: true,
        link: '#',
    },
    {
        id: 2,
        tag: 'MUST-WATCH WEBINAR',
        tagColor: 'teal',
        title: 'Ethics, Consent & Sexual Assault',
        excerpt: 'Navigating the Grey Areas in MRCOG Part 3',
        image: newsImg1,
        link: 'https://youtu.be/qposcLCtyNg?si=I4KOMktrb7rBD5lg',
    },
    {
        id: 3,
        tag: '📢 GUIDELINE UPDATE',
        title: 'NHS Cervical Screening Pathway (NHCSP)',
        excerpt: '2025–2026 Updates Explained',
        image: newsImg2,
        link: 'https://youtu.be/P9-xFt33t5U?si=1NACMIAOThgEi_0s',
    },
    {
        id: 4,
        tag: '📚 RECENT RECALL MAY 2026 PART 3 EXAM',
        title: 'Endometrial Cancer',
        excerpt: 'FIGO 2023 Staging & Molecular Classification',
        image: newsImg3,
        link: 'https://youtu.be/F7No9HAkGGA?si=hoKoesj4xuGwtcur',
    },
];

const News = () => {
    return (
        <section className="news section" id="news">
            <div className="container">
                <h2 className="section-heading">
                    Latest <span className="highlight-navy">News and Resources</span>
                </h2>
                <p className="section-subheading">
                    Never Miss an Update from Elite MRCOG
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
                    </div>

                    {/* Right column — 3 smaller */}
                    <div className="news__sidebar">
                        {articles.slice(1).map((art) => (
                            <a href={art.link} target="_blank" rel="noopener noreferrer" className="news__article news__article--small" key={art.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                <div className="news__small-wrap">
                                    <div className="news__small-img-wrap">
                                        <img src={art.image} alt={art.title} className="news__small-img" />
                                    </div>
                                    <div className="news__small-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                                        <span className={`news__tag ${art.tagColor === 'teal' ? ' news__tag--press' : ''}`} style={{ alignSelf: 'flex-start', marginBottom: '2px' }}>
                                            {art.tag}
                                        </span>
                                        <h3 className="news__small-title">{art.title}</h3>
                                        <p className="news__excerpt">{art.excerpt}</p>
                                        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                                            <span style={{ color: 'var(--color-teal)', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                ▶ Watch Now
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default News;
