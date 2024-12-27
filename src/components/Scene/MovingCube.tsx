import React from 'react'
import THREE from 'three'

interface MovingCubeProps {
  movingCubeRef: React.MutableRefObject<THREE.Group | null>
  collisionSphereRef: React.MutableRefObject<THREE.Mesh | null>
}

export const MovingCube = ({
  movingCubeRef,
  collisionSphereRef,
}: MovingCubeProps) => {
  return (
    <>
      <group ref={movingCubeRef} position={[0, 1, 0]}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0, 0]} ref={collisionSphereRef}>
          {/* 立方体を包む大きさ */}
          <sphereGeometry args={[Math.sqrt(5) / 2, 32, 32]} />
          <meshBasicMaterial visible={true} color="#000000" />
        </mesh>
      </group>
    </>
  )
}
