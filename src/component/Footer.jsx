export default function Footer() {
  return (
    <footer className="relative py-8 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/35">
        <p>&copy; {new Date().getFullYear()} Alex Rivera. All rights reserved.</p>
        <p>Designed &amp; built with React and Three.js.</p>
      </div>
    </footer>
  )
}
