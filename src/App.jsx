import Navbar from './components/Navbar.jsx'
import Experience from './components/Experience.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main>
        <Experience />
        <div className="relative z-10">
          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  )
}
