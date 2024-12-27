// import { OrbitControls } from '@react-three/drei'
// import * as THREE from 'three'
// import { useControls } from 'leva'

// import { useRef } from 'react'
import { Scene } from './Scene/Scene'

export const Experience = (): JSX.Element => {
  return (
    <>
      <color attach="background" args={['#000000']} />
      {/* <OrbitControls /> */}
      <Scene />
    </>
  )
}
