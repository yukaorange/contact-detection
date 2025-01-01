import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
// import * as THREE from 'three'
// import { useControls } from 'leva'
// import { useRef } from 'react'
import { Scene } from './Scene/Scene'

export const Experience = (): JSX.Element => {
  const { camera } = useThree()

  if (window.innerWidth < 768) {
    camera.position.set(4.5, 6, 12)
  } else {
    camera.position.set(4.5, 3.5, 6.0)
  }

  return (
    <>
      <color attach="background" args={['#000000']} />
      <OrbitControls
        // 垂直回転の制限（ラジアン単位）
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.5}
        // 水平回転の制限（ラジアン単位）
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
        // ズームの制限
        minDistance={5} // カメラの最小距離
        maxDistance={10} // カメラの最大距離
        // オプション: 慣性の追加
        enableDamping={true}
        dampingFactor={0.1}
      />
      <Scene />
    </>
  )
}
