import React from 'react'
import THREE from 'three'

interface MovingCubesProps {
  movingCubeRef: React.MutableRefObject<THREE.Group | null>
  collisionSphereRef: React.MutableRefObject<THREE.Mesh | null>
  cubeSize: number
  sphereRadius: number
}

export const MovingCubes = ({
  movingCubeRef,
  collisionSphereRef,
  cubeSize,
  sphereRadius,
}: MovingCubesProps) => {
  return (
    <>
      <group ref={movingCubeRef} position={[0, 1, 0]}>
        <mesh>
          <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0, 0]} ref={collisionSphereRef}>
          {/* 立方体を包む大きさ */}
          <sphereGeometry args={[sphereRadius, 32, 32]} />
          <meshBasicMaterial visible={true} color="#5bfd1b" />
        </mesh>
      </group>
    </>
  )
}
