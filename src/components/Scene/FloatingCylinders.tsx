import React from 'react'
import { useMemo } from 'react'

import vertexshader from '@/shaders/floatingCylinder/vertex.glsl'
import fragmentShader from '@/shaders/floatingCylinder/fragment.glsl'
import { useFrame } from '@react-three/fiber'

interface FloatingCylindersProps {
  floatingCylinerRef: React.MutableRefObject<THREE.Mesh | null>
}

export const FloatingCylinders = ({
  floatingCylinerRef,
}: FloatingCylindersProps) => {
  const uniforms = useMemo(() => {
    return {
      uTime: {
        value: 0,
      },
      uRenderContactDitection: {
        value: 0,
      },
    }
  }, [])

  useFrame((state) => {
    const { clock } = state

    const shaderMaterial = floatingCylinerRef.current
      ?.material as THREE.ShaderMaterial

    shaderMaterial.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh
      ref={floatingCylinerRef}
      position={[-0.5, 1.0, 1.5]}
      rotation={[Math.PI / 4, Math.PI / 4, 0]}
    >
      <cylinderGeometry args={[0.25, 0.25, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexshader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}
