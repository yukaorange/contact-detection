import React, { useMemo, useCallback, useEffect } from 'react'

import vertexshader from '@/shaders/ground/vertex.glsl'
import fragmentShader from '@/shaders/ground/fragment.glsl'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface GroundProps {
  groundRef: React.MutableRefObject<THREE.Mesh | null>
}

export const Ground = ({ groundRef }: GroundProps) => {
  const uniforms = useMemo(() => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

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
      uResolution: {
        value: new THREE.Vector2(width, height),
      },
      tContactDitectionTexture: { value: null },
    }
  }, [])

  const handleResize = useCallback(() => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    if (groundRef.current) {
      const shaderMaterial = groundRef.current.material as THREE.ShaderMaterial

      shaderMaterial.uniforms.uResolution.value = new THREE.Vector2(
        width,
        height,
      )
    }
  }, [groundRef])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

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
