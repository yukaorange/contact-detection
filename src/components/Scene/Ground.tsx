import React, { useRef } from 'react'

import vertexshader from '@/shaders/ground/vertex.glsl'
import fragmentShader from '@/shaders/ground/fragment.glsl'
import THREE from 'three'

export const Ground = () => {
  const groundRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10, 10, 10]} />
      <shaderMaterial
        vertexShader={vertexshader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}
