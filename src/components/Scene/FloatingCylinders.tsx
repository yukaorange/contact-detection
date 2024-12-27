import React from 'react'

export const FloatingCylinders = () => {
  return (
    <mesh position={[-0.5, 0.5, 1.5]}>
      <cylinderGeometry args={[0.5, 0.5, 1, 32, 32]} />
      <meshBasicMaterial color="#8a36a3" />
    </mesh>
  )
}
