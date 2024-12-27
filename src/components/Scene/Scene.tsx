import React, { useCallback, useRef, useState } from 'react'
import { Ground } from './Ground'
import { TransparentSphere } from './TransparentSphere'
import { MovingCube } from './MovingCube'
import THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass, ShaderPass } from 'three/examples/jsm/Addons.js'
import { DepthShaderConfig } from './Effect/DepthShaderConfig'

import { useEffect } from 'react'

import { DragControls } from '@react-three/drei'
import { FloatingCylinders } from './FloatingCylinders'

export const Scene = () => {
  const [composer, setComposer] = useState<EffectComposer | null>(null)

  const transparentSphereRef = useRef<THREE.Mesh>(null)
  const movingCubeRef = useRef<THREE.Group>(null)
  const collisitonRef = useRef<THREE.Mesh>(null)
  // Three.js
  const { gl, scene, camera } = useThree()

  /**
   * コンポーザーのリサイズ
   */
  const handleResize = useCallback(() => {
    composer?.setSize(window.innerWidth, window.innerHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * コンポーザーの初期化
   */
  useEffect(() => {
    const effectComposer = new EffectComposer(gl)

    //シーンをレンダリング
    const renderPass = new RenderPass(scene, camera)

    //エフェクト
    const depthPass = new ShaderPass(DepthShaderConfig)

    // 低負荷ジャギー軽減処理
    const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight)

    if (camera) {
      console.log('camera near :', camera.near, 'camera far :', camera.far)

      depthPass.uniforms.cameraNear.value = camera.near
      depthPass.uniforms.cameraFar.value = camera.far
    }

    effectComposer.addPass(renderPass)
    effectComposer.addPass(depthPass)
    effectComposer.addPass(smaaPass)

    setComposer(effectComposer)

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera])

  /**
   * ループ処理
   */
  useFrame((state) => {
    // const { gl } = state
  })

  return (
    <>
      <ambientLight intensity={0.01} />
      {/* 半透明の球体 */}
      <TransparentSphere transparentSphereRef={transparentSphereRef} />
      {/* 固定された円柱 */}
      <FloatingCylinders />
      <DragControls axisLock="y">
        {/* 動く立方体(接触判定は球体が担う) */}
        <MovingCube
          movingCubeRef={movingCubeRef}
          collisionSphereRef={collisitonRef}
        />
      </DragControls>
      <Ground />
    </>
  )
}
