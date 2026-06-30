import LandingNav from './_components/LandingNav'
import HeroSection from './_components/HeroSection'
import FeaturesSection from './_components/FeaturesSection'
import HowItWorksSection from './_components/HowItWorksSection'
import CTASection from './_components/CTASection'
import LandingFooter from './_components/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
