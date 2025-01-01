import React, { useMemo, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { animateGroup } from './MovingCubesAnimation'
import { MovingCube } from './MovingCube'

type AnimationType = 'linear' | 'circular' | 'custom'

// 基本アニメーション設定
interface BaseAnimationConfig {
  type: AnimationType
  enabled?: boolean
  rotationEnabled?: boolean
  rotationSpeed?: [number, number, number]
}

// 直線運動の設定
interface LinearAnimationConfig extends BaseAnimationConfig {
  type: 'linear'
  axis: 'x' | 'y' | 'z'
  amplitude: number
  frequency: number
  phase?: number
}

// 円運動の設定
interface CircularAnimationConfig extends BaseAnimationConfig {
  type: 'circular'
  plane: 'xy' | 'yz' | 'xz'
  radius: number
  speed: number
  centerOffset?: [number, number, number]
  phase?: number
}

// カスタムアニメーションの設定
interface CustomAnimationConfig extends BaseAnimationConfig {
  type: 'custom'
  animate: (
    time: number,
    group: THREE.Group,
    initialPosition: THREE.Vector3,
  ) => void
}

type AnimationConfig =
  | LinearAnimationConfig
  | CircularAnimationConfig
  | CustomAnimationConfig

export interface CubeConfig {
  position: [number, number, number]
  rotation?: [number, number, number]
  size?: number
  animation?: AnimationConfig
}

interface MovingCubesProps {
  cubeRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
  collisionSphereRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
  groupRefs: React.MutableRefObject<(THREE.Group | null)[]>
  configs: CubeConfig[]
  sphereRadius: number
}

export const MovingCubes: React.FC<MovingCubesProps> = ({
  cubeRefs,
  collisionSphereRefs,
  groupRefs,
  configs,
  sphereRadius,
}) => {
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
      uResolution: {
        value: new THREE.Vector2(width, height),
      },
      tContactDitectionTexture: {
        value: null,
      },
    }
  }, [])

  const handleResize = useCallback(() => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    cubeRefs.current.forEach((cube) => {
      if (cube) {
        const shaderMaterial = cube.material as THREE.ShaderMaterial
        shaderMaterial.uniforms.uResolution.value = new THREE.Vector2(
          width,
          height,
        )
      }
    })
  }, [cubeRefs])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  const initialPositions = useMemo(() => {
    return configs.map((config) => new THREE.Vector3(...config.position))
  }, [configs])

  useFrame((state) => {
    const { clock } = state
    const elapsedTime = clock.getElapsedTime()

    cubeRefs.current.forEach((cube) => {
      if (cube) {
        const material = cube.material as THREE.ShaderMaterial
        material.uniforms.uTime.value = elapsedTime
      }
    })

    groupRefs.current.forEach((group, index) => {
      if (group && configs[index].animation) {
        animateGroup(
          group,
          configs[index],
          elapsedTime,
          initialPositions[index],
        )
      }
    })
  })

  return (
    <>
      {configs.map((config, index) => {
        const cubeSize = config.size || 0.75
        return (
          <MovingCube
            key={index}
            ref={(el) => (groupRefs.current[index] = el)}
            cubeRef={(el) => (cubeRefs.current[index] = el)}
            collisionSphereRef={(el) =>
              (collisionSphereRefs.current[index] = el)
            }
            config={config}
            cubeSize={cubeSize}
            sphereRadius={sphereRadius}
            uniforms={uniforms}
          />
        )
      })}
    </>
  )
}
