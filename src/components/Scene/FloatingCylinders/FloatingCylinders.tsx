import React from 'react'
import { useMemo, useCallback, useEffect, forwardRef } from 'react'
import * as THREE from 'three'

import vertexShader from '@/shaders/object/vertex.glsl'
import fragmentShader from '@/shaders/object/fragment.glsl'
import { useFrame } from '@react-three/fiber'

interface CylinderConfig {
  position: [number, number, number]
  rotation: [number, number, number]
  radius?: number
  height?: number
  segments?: number
}
interface FloatingCylindersProps {
  floatingCylinerRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
  configs: CylinderConfig[]
}
interface FloatingCylinderProps {
  config: CylinderConfig
  uniforms: {
    [key: string]: THREE.IUniform
  }
}

// Single cylinder component

const FloatingCylinder = forwardRef<THREE.Mesh, FloatingCylinderProps>(
  ({ config, uniforms }, ref) => {
    const {
      position,
      rotation,
      radius = 0.25,
      height = 1,
      segments = 24,
    } = config

    return (
      <mesh ref={ref} position={position} rotation={rotation}>
        <cylinderGeometry args={[radius, radius, height, segments, segments]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    )
  },
)
FloatingCylinder.displayName = 'FloatingCylinder'

export const FloatingCylinders = ({
  floatingCylinerRefs,
  configs,
}: FloatingCylindersProps) => {
  const uniforms = useMemo(() => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr
    return {
      uTime: {
        value: 0,
      },
      uRenderContactDitection: {
        value: 0,
      },
      uResolution: { value: new THREE.Vector2(width, height) },
      tContactDitectionTexture: { value: null },
    }
  }, [])

  const handleResize = useCallback(() => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    floatingCylinerRefs.current.forEach((cylinder) => {
      if (cylinder) {
        const shaderMaterial = cylinder.material as THREE.ShaderMaterial

        shaderMaterial.uniforms.uResolution.value = new THREE.Vector2(
          width,
          height,
        )
      }
    })
  }, [floatingCylinerRefs])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  useFrame((state) => {
    const { clock } = state

    floatingCylinerRefs.current.forEach((cylinder) => {
      if (cylinder) {
        const shaderMaterial = cylinder.material as THREE.ShaderMaterial

        shaderMaterial.uniforms.uTime.value = clock.getElapsedTime()
      }
    })
  })

  return (
    <>
      {configs.map((config, index) => (
        <FloatingCylinder
          key={index}
          ref={(el) => (floatingCylinerRefs.current[index] = el)}
          config={config}
          uniforms={uniforms}
        />
      ))}
    </>
  )
}
