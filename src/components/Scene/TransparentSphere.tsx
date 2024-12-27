import React from 'react'
import THREE from 'three'

interface TransparentSphereProps {
  transparentSphereRef: React.MutableRefObject<THREE.Mesh | null>
}

export const TransparentSphere = ({
  transparentSphereRef,
}: TransparentSphereProps) => {
  return (
    <mesh ref={transparentSphereRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial transparent opacity={0.5} color="#4466ff" />
    </mesh>
  )
}
