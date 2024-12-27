import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { Loader } from '@/components/Loader'

import { Experience } from '@/components/Experience'
import { Sns } from '@/components/Sns'
import { MenuButton } from '@/components/MenuButton'
import { Leva, useControls } from 'leva'
import { Suspense } from 'react'

const App = () => {
  return (
    <>
      <Leva />
      <MenuButton />
      <Sns />
      <Canvas
        camera={{
          position: [3, 3, 5],
          fov: 45,
          near: 0.1,
          far: 7.5, //far彩度の距離が遠すぎると、深度が極端に大きくなり、扱えないので、適当な値に設定する。
        }}
        dpr={[1, 2]}
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
