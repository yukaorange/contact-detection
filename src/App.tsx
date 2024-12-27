import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { Loader } from '@/components/Loader'

import { Experience } from '@/components/Experience'
import { Sns } from '@/components/Sns'
import { MenuButton } from '@/components/MenuButton'
import { Leva } from 'leva'
import { Suspense } from 'react'

const App = () => {
  return (
    <>
      <Leva collapsed />
      <MenuButton />
      <Sns />
      <Canvas
        camera={{
          position: [3, 3, 5],
          fov: 45,
        }}
      >
        <Perf position="top-left" />
        <Suspense fallback={<Loader />}>
          <Experience />
        </Suspense>
      </Canvas>
    </>
  )
}

export default App
