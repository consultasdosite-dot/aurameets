import Header from "./Header";
import Hero from "./Hero";
import Benefits from "./Benefits";
import HowItWorks from "./HowItWorks";
import Specialties from "./Specialties";
import Founder from "./Founder";
import Plans from "./Plans";
import FounderBenefits from "./FounderBenefits";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import CTA from "./CTA";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <main className="bg-[#060B1F] text-white overflow-hidden">
      <Header />
      <Hero />
      <Benefits />
      <HowItWorks />
      <Specialties />
      <Founder />
      <Plans />
      <FounderBenefits />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}