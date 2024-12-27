import React, { useCallback, useRef, useState } from 'react'
import { Ground } from './Ground'
import { ZennlessZoneSphere } from './ZennlessZoneSphere'
import { MovingCubes } from './MovingCubes'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { SMAAPass, ShaderPass } from 'three/examples/jsm/Addons.js'
import { CheckDepthPassConfig } from './PostProcess/CheckDepthPassConfig'

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
   * シーンに配置する各メッシュのRefオブジェクトを初期化
   */
  const zennlessZoneSphereRef = useRef<THREE.Mesh>(null)
  const movingCubeRef = useRef<THREE.Group>(null)
  const collisitonRef = useRef<THREE.Mesh>(null)
  /**
   * ２種類の球体の半径を設定
   */
  const sphereRadius = 2
  const cubeSize = 1
  const collisionSphereRadius = Math.sqrt(5) / 2 // 立方体の対角線の半分の長さ

  /**
   * three.jsの各オブジェクトを取得
   */
  const { gl, scene, camera } = useThree()

  /**
   * リサイズ
   */
  const handleResize = useCallback(() => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    // console.log('resize : ', width, height)

    composer?.setSize(width, height)

    // composerは毎フレーム更新されるので、ここの依存配列には入れないでおく。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * 初期設定を行う
   */
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

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
      const { clock } = state
      /**
       * 中央の球体、接触判定用の球体を不可視にする
       */
      if (zennlessZoneSphereRef.current) {
        zennlessZoneSphereRef.current.visible = false
      }
      if (collisitonRef.current) {
        collisitonRef.current.visible = false
      }

      /**
       * 深度バッファに深度値を焼き付ける
       */
      if (depthRenderTarget && gl && scene && camera) {
        gl.setRenderTarget(depthRenderTarget)
        gl.render(scene, camera)
        gl.setRenderTarget(null)
      }

      /**
       * 接触点の割り出し
       */
      if (zennlessZoneSphereRef.current && collisitonRef.current) {
        //マテリアルの準備
        const shaderMaterial = zennlessZoneSphereRef.current
          .material as THREE.ShaderMaterial

        //タイム更新
        shaderMaterial.uniforms.uTime.value = clock.getElapsedTime()

        //中央の球体のワールド座標を取得
        const sphereCenter = new THREE.Vector3()
        zennlessZoneSphereRef.current.getWorldPosition(sphereCenter)

        //接触判定用の球体のワールド座標を取得
        const collisionCenter = new THREE.Vector3()
        collisitonRef.current.getWorldPosition(collisionCenter)

        //接触判定用の球体の中心から中央の球体の中心へのベクトルを取得
        //subは呼び出し元のベクトルを変更するので、clone()してから呼び出している。collisionCenterからsphereCenterへの正規化ベクトルを取得
        const direction = collisionCenter.clone().sub(sphereCenter).normalize()
        const distance = collisionCenter.distanceTo(sphereCenter)

        const totalRadius = sphereRadius + collisionSphereRadius

        // 接触が発生している場合のみ接触点を計算
        if (distance < totalRadius) {
          //接触量
          const penetrationDepth = totalRadius - distance

          //接触量を正規化
          const normalizedPenetrationDepth = Math.min(
            penetrationDepth / totalRadius,
            1.0,
          )

          // 接触点を計算（考え方はsubの時と同様）
          const contactPoint = sphereCenter
            .clone()
            .add(direction.multiplyScalar(sphereRadius))

          shaderMaterial.uniforms.contactPoint.value = contactPoint
          shaderMaterial.uniforms.uContactIntensity.value =
            normalizedPenetrationDepth
          shaderMaterial.uniforms.uHasContact.value = 1.0

          // デバッグ用
          console.log('接触点:', contactPoint)
        } else {
          // 接触していない場合
          shaderMaterial.uniforms.uHasContact.value = 0.0
        }

        // デバッグ用
        // console.log(
        //   'sphereCenter : ',
        //   sphereCenter,
        //   '\n',
        //   'collisionCenter : ',
        //   collisionCenter,
        //   '\n',
        //   'direction : ',
        //   direction,
        //   '\n',
        //   'distance : ',
        //   distance,
        //   '\n',
        //   '接触判定の閾値',
        //   sphereRadius + collisionSphereRadius,
        //   '\n',
        // )
      }
      /**
       * 中央の球体を可視にする
       */
      // if (collisitonRef.current) {
      //   collisitonRef.current.visible = true
      // }
      if (zennlessZoneSphereRef.current) {
        zennlessZoneSphereRef.current.visible = true
      }

      /**
       * エフェクトコンポーザーのレンダリング
       */
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
      <ZennlessZoneSphere
        zennlessZoneSphereRef={zennlessZoneSphereRef}
        depthTexture={depthRenderTarget?.depthTexture || null}
        sphereRadius={sphereRadius}
      />
      {/* 固定された円柱 */}
      <FloatingCylinders />
      <DragControls axisLock="y">
        {/* 動く立方体(接触判定は球体が担う) */}
        <MovingCubes
          movingCubeRef={movingCubeRef}
          collisionSphereRef={collisitonRef}
          cubeSize={cubeSize}
          sphereRadius={collisionSphereRadius}
        />
      </DragControls>
      <Ground />
    </>
  )
}
