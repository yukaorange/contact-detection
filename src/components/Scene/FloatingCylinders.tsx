import React from 'react'
import { useMemo, useCallback, useEffect } from 'react'
import * as THREE from 'three'

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
      uResolution: { value: new THREE.Vector2(0, 0) },
      tContactDitectionTexture: { value: null },
    }
  }, [])

  const handleResize = useCallback(() => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    if (floatingCylinerRef.current) {
      const shaderMaterial = floatingCylinerRef.current
        .material as THREE.ShaderMaterial

      shaderMaterial.uniforms.uResolution.value = new THREE.Vector2(
        width,
        height,
      )
    }
  }, [floatingCylinerRef])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

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
