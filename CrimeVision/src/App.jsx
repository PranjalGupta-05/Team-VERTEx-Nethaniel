import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Modules from './components/Modules.jsx'
import Pipeline from './components/Pipeline.jsx'
import AlertFeed from './components/AlertFeed.jsx'
import Trust from './components/Trust.jsx'
import CTA from './components/CTA.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <main>
        <Hero />
        <Modules />
        <Pipeline />
        <AlertFeed />
        <Trust />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
