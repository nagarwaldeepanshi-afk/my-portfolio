import { Canvas } from '@react-three/fiber'
import AsciiField from './AsciiField.jsx'
import PCBModel from './PCBModel.jsx'
import PCBLabels from './PCBLabels.jsx'
import UsbCable from './UsbCable.jsx'
import Display from './Display.jsx'
import CameraRig from './CameraRig.jsx'

// Single shared 3D canvas behind Hero + About (+ Projects on capable
// devices). The ascii field scatters and reacts to the cursor in the hero,
// accumulates into a PCB shape through About, crossfades into a solid lit
// PCB model, then — if the Projects scene is enabled — a USB cable draws
// itself from the board to a display that powers on and shows the projects.
export default function CodeUniverse({
  heroAboutProgress,
  projectsProgress = 0,
  showProjectsScene = false,
  active,
}) {
  return (
    <div
      className="fixed inset-0 z-0 transition-opacity duration-700 ease-out"
      style={{ opacity: active ? 1 : 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <pointLight position={[-2, -1, 3]} intensity={0.5} color="#40e0d0" />
        <pointLight position={[3, 2, 2]} intensity={0.4} color="#7c5cff" />
        {showProjectsScene && (
          <pointLight position={[9.2, 1, 2.5]} intensity={0.6} color="#dfe8ff" />
        )}

        <CameraRig
          heroAboutProgress={heroAboutProgress}
          projectsProgress={projectsProgress}
          projectsActive={showProjectsScene}
        />

        <AsciiField progress={heroAboutProgress} />
        <PCBModel progress={heroAboutProgress} />
        <PCBLabels progress={heroAboutProgress} />

        {showProjectsScene && (
          <>
            <UsbCable progress={projectsProgress} />
            <Display progress={projectsProgress} />
          </>
        )}
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink pointer-events-none" />
    </div>
  )
}
