import PageTransition from '../components/layout/PageTransition';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import ModelHighlights from '../components/landing/ModelHighlights';
import CTABanner from '../components/landing/CTABanner';

const LandingPage = () => {
  return (
    <PageTransition>
      <Hero />
      <HowItWorks />
      <ModelHighlights />
      <CTABanner />
    </PageTransition>
  );
};

export default LandingPage;
