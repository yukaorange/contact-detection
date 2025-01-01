import React, { useMemo } from 'react'

import vertexshader from '@/shaders/ground/vertex.glsl'
import fragmentShader from '@/shaders/ground/fragment.glsl'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface GroundProps {
  groundRef: React.MutableRefObject<THREE.Mesh | null>
}

export const Ground = ({ groundRef }: GroundProps) => {
  const uniforms = useMemo(() => {
    return {
      uTime: {
        value: 0,
      },
      uGridItteration: {
        value: 64,
      },
      uRenderContactDitection: {
        value: 0,
      },
      tContactDitectionTexture: { value: null },
    }
  }, [])

  useFrame((state) => {
    const { clock } = state

    const shaderMaterial = groundRef.current?.material as THREE.ShaderMaterial

    shaderMaterial.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh ref={groundRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10, 10, 10]} />
      <shaderMaterial
        vertexShader={vertexshader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}
