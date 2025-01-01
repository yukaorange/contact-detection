import React from 'react'
import * as THREE from 'three'
import { useMemo, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

import vertexshader from '@/shaders/object/vertex.glsl'
import fragmentShader from '@/shaders/object/fragment.glsl'

// interface CubeConfig {
//   position: [number, number, number]
//   rotation: [number, number, number]
//   size: number
//   movement ? : {

//   }
// }


interface MovingCubesProps {
  movingCubeRef: React.MutableRefObject<THREE.Group | null>
  collisionSphereRef: React.MutableRefObject<THREE.Mesh | null>
  cubeRef: React.MutableRefObject<THREE.Mesh | null>
  cubeSize: number
  sphereRadius: number
}

export const MovingCubes = ({
  movingCubeRef,
  collisionSphereRef,
  cubeRef,
  cubeSize,
  sphereRadius,
}: MovingCubesProps) => {
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

    if (cubeRef.current) {
      const shaderMaterial = cubeRef.current.material as THREE.ShaderMaterial

      shaderMaterial.uniforms.uResolution.value = new THREE.Vector2(
        width,
        height,
      )
    }
  }, [cubeRef])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  useFrame((state) => {
    const { clock } = state

    const shaderMaterial = cubeRef.current?.material as THREE.ShaderMaterial

    shaderMaterial.uniforms.uTime.value = clock.getElapsedTime()

    if (movingCubeRef.current) {
      movingCubeRef.current.position.x =
        Math.sin(clock.getElapsedTime()) * 1.5 + 1.5
    }
  })

  return (
    <>
      <group ref={movingCubeRef} position={[1.5, 1, 0]}>
        <mesh ref={cubeRef}>
          <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
          <shaderMaterial
            vertexShader={vertexshader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
          />
        </mesh>
        <mesh position={[0, 0, 0]} ref={collisionSphereRef}>
          {/* 立方体を包む大きさ */}
          <sphereGeometry args={[sphereRadius, 32, 32]} />
          <meshBasicMaterial visible={false} color="#000000" />
        </mesh>
      </group>
    </>
  )
}
