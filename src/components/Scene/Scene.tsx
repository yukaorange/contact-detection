import React, { useCallback, useRef, useState } from 'react'
import { Ground } from './Ground'
import { ZennlessZoneSphere } from './ZennlessZoneSphere'
import { MovingCube } from './MovingCube'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass, ShaderPass } from 'three/examples/jsm/Addons.js'
import { CheckDepthPassConfig } from './Effect/CheckDepthPassConfig'

import { useEffect } from 'react'

import { DragControls } from '@react-three/drei'
import { FloatingCylinders } from './FloatingCylinders'

export const Scene = () => {
  /**
   * コンポーザーを保持
   */
  const [composer, setComposer] = useState<EffectComposer | null>(null)
  //depthRenderTargetは使わないが、dispose()するためにuseStateで保持
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [depthRenderTarget, setDepthRenderTarget] =
    useState<THREE.WebGLRenderTarget | null>(null)

  /**
   * dprを固定し、プロジェクトで扱う画面サイズを提供
   */
  const dpr = Math.min(window.devicePixelRatio, 2)
  const width = window.innerWidth * dpr
  const height = window.innerHeight * dpr
  /**
   * シーンに配置する各メッシュのRefオブジェクトを初期化
   */
  const zennlessZoneSphereRef = useRef<THREE.Mesh>(null)
  const movingCubeRef = useRef<THREE.Group>(null)
  const collisitonRef = useRef<THREE.Mesh>(null)
  /**
   * three.jsの各オブジェクトを取得
   */
  const { gl, scene, camera } = useThree()

  /**
   * リサイズ
   */
  const handleResize = useCallback(() => {
    console.log('resize')

    composer?.setSize(width, height)

    //深度値取得用のレンダーターゲットを更新
    if (depthRenderTarget) {
      depthRenderTarget.setSize(window.innerWidth, window.innerHeight)
      depthRenderTarget.depthTexture.image.width = width
      depthRenderTarget.depthTexture.image.height = height
      depthRenderTarget.depthTexture.needsUpdate = true
    }

    // composerは毎フレーム更新されるので、ここの依存配列には入れないでおく。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * 初期設定を行う
   */
  useEffect(() => {
    console.log('init Scene')

    //深度を取得するための下準備
    const depthRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      //LinearFilterは、テクスチャを縮小する際に、近くのピクセルの色を平均化して滑らかな縮小を行う。
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: true,
      depthTexture: new THREE.DepthTexture(width, height, THREE.FloatType),
    })

    setDepthRenderTarget(depthRenderTarget)

    //エフェクトコンポーザーの初期化
    const effectComposer = new EffectComposer(gl)

    //シーンをレンダリング
    const renderPass = new RenderPass(scene, camera)

    //深度が取れているかの確認用
    const CheckDepthPass = new ShaderPass(CheckDepthPassConfig)
    /**
     * 深度パスのuniformsに、深度テクスチャを設定する
     */
    CheckDepthPass.uniforms.tDepth.value = depthRenderTarget.depthTexture
    CheckDepthPass.uniforms.cameraNear.value = camera.near
    CheckDepthPass.uniforms.cameraFar.value = camera.far

    /**
     * 深度テクスチャをZennlessZoneShpereに送信し、接触判定などに使用する
     */
    if (zennlessZoneSphereRef.current) {
      const material = zennlessZoneSphereRef.current
        .material as THREE.ShaderMaterial
      material.uniforms.tDepth.value = depthRenderTarget.depthTexture
      material.uniforms.cameraNear.value = camera.near
      material.uniforms.cameraFar.value = camera.far
      material.uniforms.uResolution.value = new THREE.Vector2(width, height)
    }

    // 低負荷ジャギー軽減処理
    const smaaPass = new SMAAPass(width, height)

    if (camera) {
      // console.log('camera_near :', camera.near, 'camera_far :', camera.far)
      //深度を取得するために、カメラの視錐台のニアサイドとファーサイドを設定
      CheckDepthPass.uniforms.cameraNear.value = camera.near
      CheckDepthPass.uniforms.cameraFar.value = camera.far
    }
    // if (gl) {
    //   console.log('gl_size :', gl.getSize(new THREE.Vector2()))
    // }

    effectComposer.addPass(renderPass)
    //深度を確認するときだけ有効にする
    // effectComposer.addPass(CheckDepthPass)
    effectComposer.addPass(smaaPass)

    setComposer(effectComposer)

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (composer) {
        composer.dispose()
      }
      if (depthRenderTarget) {
        depthRenderTarget.dispose()
      }
      setComposer(null)
      setDepthRenderTarget(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera])

  /**
   * ループ処理
   */
  useFrame(
    (state, delta) => {
      if (zennlessZoneSphereRef.current) {
        zennlessZoneSphereRef.current.visible = false
      }
      if (collisitonRef.current) {
        collisitonRef.current.visible = true
      }

      /**
       * 深度バッファに深度値を焼き付ける
       */
      if (depthRenderTarget && gl && scene && camera) {
        gl.setRenderTarget(depthRenderTarget)
        gl.render(scene, camera)
        gl.setRenderTarget(null)
      }

      if (collisitonRef.current) {
        collisitonRef.current.visible = false
      }

      if (zennlessZoneSphereRef.current) {
        zennlessZoneSphereRef.current.visible = true
      }

      composer?.render(delta)
    },
    /**
     * EffectComposerは、シーンが更新された後、画面に実際に描画される前にレンダーパスを実行する必要がある。useFrameの第二引数を他のコンポーネントよりも大きな数字（つまり後回し）に設定することで、React Three Fiberがシーンを更新した後、かつ最終的な描画呼び出しの前にEffectComposerがレンダリングされることを保証できる。
     */
    1,
  )

  return (
    <>
      <ambientLight intensity={0.01} />
      {/* 半透明の球体 */}
      <ZennlessZoneSphere zennlessZoneSphereRef={zennlessZoneSphereRef} />
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
