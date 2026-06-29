import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import AboutHero from './components/AboutHero';
import AboutMission from './components/AboutMission';
import AboutMentors from './components/AboutMentors';
import AboutValues from './components/AboutValues';
import AboutCTA from './components/AboutCTA';
import './AboutUsPage.css';

const AboutUsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-page-wrapper">
            <Navbar />
            
            <main>
                <AboutHero />
                <AboutMission />
                <AboutMentors />
                <AboutValues />
                <AboutCTA />
            </main>
            
            <Footer />
        </div>
    );
};

export default AboutUsPage;
