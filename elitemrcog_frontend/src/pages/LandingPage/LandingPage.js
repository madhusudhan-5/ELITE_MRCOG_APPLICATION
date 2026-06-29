import React, { useState } from 'react';
import '../../App.css'; // Can rename this later
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import ChoosePath from '../../components/ChoosePath/ChoosePath';
import Features from '../../components/Features/Features';
import Expertise from '../../components/Expertise/Expertise';
import Pricing from '../../components/Pricing/Pricing';
import Testimonials from '../../components/Testimonials/Testimonials';
import News from '../../components/News/News';
import Footer from '../../components/Footer/Footer';
import Popup from '../../components/Popup/Popup';
import FloatingSocial from '../../components/FloatingSocial/FloatingSocial';
import Curriculum from '../../components/Curriculum/Curriculum';
import FAQ from '../../components/FAQ/FAQ';

const LandingPage = () => {
    const [loading, setLoading] = useState(true);

    return (
        <div className="app">
            {/* Loading Screen */}
            {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

            {/* Sticky Navigation */}
            <Navbar />

            {/* Main Page Sections */}
            <main>
                <Hero />
                <ChoosePath />
                <Curriculum />
                <Features />
                <Expertise />
                <Pricing />
                <Testimonials />
                <FAQ />
                <News />
            </main>

            {/* Footer */}
            <Footer id="contact" />

            {/* Launch Popup — shows 2s after page load, dismissed via sessionStorage */}
            <Popup />

            {/* Fixed Floating Social Buttons — always visible */}
            <FloatingSocial
                telegramUrl="https://t.me/elitemrcog"
                whatsappUrl="https://wa.me/1234567890"
            />
        </div>
    );
};

export default LandingPage;
