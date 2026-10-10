import { useState, useEffect, useCallback } from 'react';
import Splash from './components/Splash';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FloatingAvatar from './components/FloatingAvatar';
import AboutSection from './components/AboutSection';
import WorkSection from './components/WorkSection';
import ExperimentsSection from './components/ExperimentsSection';
import PhilosophySection from './components/PhilosophySection';
import ProcessSection from './components/ProcessSection';
import ContactSection from './components/ContactSection';
import SkillsStrip from './components/SkillsStrip';
import Footer from './components/Footer';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const onSplashDone = useCallback(() => setSplashDone(true), []);
  const [scrollY, setScrollY] = useState(0);

  const onLoaded = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    if (!loaded) return;
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [loaded]);

  const vh = typeof window !== 'undefined' ? window.innerHeight || 800 : 800;
  const heroScroll = Math.min(1, scrollY / vh);

  return (
    <>
      {!splashDone && <Splash onReveal={onLoaded} onDone={onSplashDone} />}
      <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
        <Cursor />
        <Navbar />
        <Hero scrollProgress={heroScroll} loaded={loaded} />
        <AboutSection />
        <WorkSection />
        <ExperimentsSection />
        <PhilosophySection />
        <ProcessSection />
        <SkillsStrip />
        <ContactSection />
        <Footer />
        {loaded && <FloatingAvatar scrollY={scrollY} />}
      </div>
    </>
  );
}
