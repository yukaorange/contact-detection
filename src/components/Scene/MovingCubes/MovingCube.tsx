import React, { forwardRef } from 'react'
import * as THREE from 'three'
import vertexshader from '@/shaders/object/vertex.glsl'
import fragmentShader from '@/shaders/object/fragment.glsl'
import type { CubeConfig } from './MovingCubes'

interface MovingCubeProps {
  config: CubeConfig
  cubeSize: number
  sphereRadius: number
  uniforms: THREE.ShaderMaterialParameters['uniforms']
  cubeRef: React.Ref<THREE.Mesh>
  collisionSphereRef: React.Ref<THREE.Mesh>
}

export const MovingCube = forwardRef<THREE.Group, MovingCubeProps>(
  (
    { config, cubeSize, sphereRadius, uniforms, cubeRef, collisionSphereRef },
    groupRef,
  ) => {
    const { position, rotation = [0, 0, 0] } = config

    return (
      <group ref={groupRef} position={position} rotation={rotation}>
        <mesh ref={cubeRef}>
          <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
          <shaderMaterial
            vertexShader={vertexshader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
          />
        </mesh>
        <mesh ref={collisionSphereRef}>
          <sphereGeometry args={[sphereRadius, 32, 32]} />
          <meshBasicMaterial visible={false} color="#000000" />
        </mesh>
      </group>
    )
  },
)

MovingCube.displayName = 'MovingCube'
