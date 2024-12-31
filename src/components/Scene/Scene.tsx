import React, { useCallback, useRef } from 'react'
import { Ground } from './Ground'
import { ZennlessZoneSphere } from './ZennlessZoneSphere'
import { MovingCubes } from './MovingCubes'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SMAAPass, ShaderPass } from 'three/examples/jsm/Addons.js'
import { CheckDepthPassConfig } from './PostProcess/CheckDepthPassConfig'
import { ContactDitectionPassConfig } from './PostProcess/ContactDitectionPassConfig'

import { useEffect } from 'react'

// import { DragControls } from '@react-three/drei'
import { FloatingCylinders } from './FloatingCylinders'

export const Scene = () => {
  /**
   * コンポーザーを保持
   */
  const composerRef = useRef<EffectComposer | null>(null)
  //深度取得用のフレームバッファ
  const depthAndBackgroundRenderTargetRef =
    useRef<THREE.WebGLRenderTarget | null>(null)

  //接触判定用のフレームバッファ（ダブルバッファリングを用いて、接触判定をシーン内オブジェクトに適用する）
  const contactDitectionRenderTarget_A_Ref =
    useRef<THREE.WebGLRenderTarget | null>(null)
  const contactDitectionRenderTarget_B_Ref =
    useRef<THREE.WebGLRenderTarget | null>(null)

  const writeBufferIndexRef = useRef<0 | 1>(0)

  //ダブルバッファリングにつき、接触判定域の色を生成するパスも参照を持っておく
  const contactDitectionPassRef = useRef<ShaderPass | null>(null)

  /**
   * シーンに配置する各メッシュのRefオブジェクトを初期化
   */
  const zennlessZoneSphereRef = useRef<THREE.Mesh>(null)
  const movingCubeRef = useRef<THREE.Group>(null)
  const cubeRef = useRef<THREE.Mesh>(null)
  const floatingCylinerRef = useRef<THREE.Mesh>(null)
  const collisitonRef = useRef<THREE.Mesh>(null)
  const groundRef = useRef<THREE.Mesh>(null)

  /**
   * ２種類の球体の半径を設定
   */
  //空間対角線(Space diagonal)を求める関数。衝突する球体の半径として使用
  const getCubeDiagonal = (length: number): number => {
    return length * Math.sqrt(3)
  }

  const sphereRadius = 2
  const cubeSize = 0.75
  const collisionSphereRadius = getCubeDiagonal(cubeSize) / 2 // 空間対角線を半径/2として使用=>空間対角線が直径となる。

  /**
   * three.jsの各オブジェクトを取得（usThreeの中身は画面リサイズの度にuseStateのような変更が入るので、コンポーネントが再レンダリングされる点に留意）
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
    if (depthAndBackgroundRenderTargetRef.current) {
      depthAndBackgroundRenderTargetRef.current.setSize(width, height)
    }
    if (contactDitectionRenderTarget_A_Ref.current) {
      contactDitectionRenderTarget_A_Ref.current.setSize(width, height)
    }
    if (contactDitectionRenderTarget_B_Ref.current) {
      contactDitectionRenderTarget_B_Ref.current.setSize(width, height)
    }

    composerRef.current?.setSize(width, height)
  }, [])

  /**
   * 初期設定を行う
   */
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    console.log('init Scene @ useEffect')

    //-------深度を取得するための下準備
    const depthAndBackgroundRenderTarget = new THREE.WebGLRenderTarget(
      width,
      height,
      {
        //LinearFilterは、テクスチャを縮小する際に、近くのピクセルの色を平均化して滑らかな縮小を行う。
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.UnsignedByteType,
        depthBuffer: true,
        depthTexture: new THREE.DepthTexture(
          width,
          height,
          THREE.UnsignedByteType,
        ),
      },
    )
    depthAndBackgroundRenderTargetRef.current = depthAndBackgroundRenderTarget

    //------- 接触判定シーンをレンダリングするための下準備(ダブルバッファリングであるため、２枚のフレームバッファを初期化)
    const contactDitectionRenderTargetA = new THREE.WebGLRenderTarget(
      width,
      height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.UnsignedByteType,
        colorSpace: THREE.LinearSRGBColorSpace,
      },
    )
    const contactDitectionRenderTargetB = new THREE.WebGLRenderTarget(
      width,
      height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.UnsignedByteType,
        colorSpace: THREE.LinearSRGBColorSpace,
      },
    )
    contactDitectionRenderTarget_A_Ref.current = contactDitectionRenderTargetA
    contactDitectionRenderTarget_B_Ref.current = contactDitectionRenderTargetB

    /**
     * エフェクトコンポーザー
     */
    //-------エフェクトコンポーザーの初期化
    const effectComposer = new EffectComposer(gl)

    //-------レンダリングしたシーンを出力できるパス
    const renderPass = new RenderPass(scene, camera)

    //-------深度が取れているかの確認用パス（※デバッグ用）
    const CheckDepthPass = new ShaderPass(CheckDepthPassConfig)

    CheckDepthPass.uniforms.tDepth.value =
      depthAndBackgroundRenderTarget.depthTexture
    CheckDepthPass.uniforms.cameraNear.value = camera.near
    CheckDepthPass.uniforms.cameraFar.value = camera.far

    //--------接触判定のみをレンダリングするためのパス（エフェクトを適用する）
    const contactDitectionPass = new ShaderPass(ContactDitectionPassConfig)

    //ダブルバッファリングで、Aを初期値として設定
    contactDitectionPass.uniforms.tContactDitectionDiffuse.value =
      contactDitectionRenderTargetA.texture

    contactDitectionPass.uniforms.uResolution.value = new THREE.Vector2(
      width,
      height,
    )

    contactDitectionPass.uniforms.uAspect.value = width / height

    //参照をもっておき、ループ時にテクスチャを交換できるようにする
    contactDitectionPassRef.current = contactDitectionPass

    //-------ブルームエフェクト
    const unrealBloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.36, //strength
      0.01, //radius
      0.01, //threshold
    )

    //-------低負荷ジャギー軽減処理
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

    /**
     * コンポーザーにパスを追加
     */
    effectComposer.addPass(renderPass)
    //深度を確認するときだけ有効にする
    // effectComposer.addPass(CheckDepthPass)
    effectComposer.addPass(contactDitectionPass)
    effectComposer.addPass(unrealBloomPass)
    effectComposer.addPass(smaaPass)

    composerRef.current = effectComposer

    //------- リサイズイベントの登録とアンマウント時に解除
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (composerRef.current) {
        composerRef.current.dispose()
      }
      if (depthAndBackgroundRenderTargetRef.current) {
        depthAndBackgroundRenderTargetRef.current.dispose()
      }
      if (contactDitectionRenderTarget_A_Ref.current) {
        contactDitectionRenderTarget_A_Ref.current.dispose()
      }
      if (contactDitectionRenderTarget_B_Ref.current) {
        contactDitectionRenderTarget_B_Ref.current.dispose()
      }
      composerRef.current = null
      depthAndBackgroundRenderTargetRef.current = null
      contactDitectionRenderTarget_A_Ref.current = null
      contactDitectionRenderTarget_B_Ref.current = null
    }
  }, [gl, scene, camera, handleResize])

  /**
   * ループ処理
   */
  useFrame(
    (_, delta) => {
      // バッファの交換を行う
      writeBufferIndexRef.current = writeBufferIndexRef.current === 0 ? 1 : 0

      // 書き込み用と読み込み用のバッファを取得
      const writeTarget =
        writeBufferIndexRef.current === 0
          ? contactDitectionRenderTarget_A_Ref.current
          : contactDitectionRenderTarget_B_Ref.current
      const readTarget =
        writeBufferIndexRef.current === 0
          ? contactDitectionRenderTarget_B_Ref.current
          : contactDitectionRenderTarget_A_Ref.current

      /**
       * 中央の球体、接触判定用の球体を不可視にする
       */
      if (zennlessZoneSphereRef.current) {
        zennlessZoneSphereRef.current.visible = false
      }

      /**
       * 深度バッファに深度値を焼き付ける
       */
      if (depthAndBackgroundRenderTargetRef.current && gl && scene && camera) {
        gl.setRenderTarget(depthAndBackgroundRenderTargetRef.current)
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
          // 完全にめり込んだ状態（内側に収まった状態）をチェック
          if (distance <= Math.abs(sphereRadius - collisionSphereRadius)) {
            // 完全にめり込んだ状態では接触なし
            shaderMaterial.uniforms.uHasContact.value = 0.0
          } else {
            //めり込みの進行度を計算
            const penetrationProgress =
              (totalRadius - distance) /
              (totalRadius - Math.abs(sphereRadius - collisionSphereRadius))

            // 0.5を頂点とする放物線状の接触量を計算
            // penetrationProgressが0.5の時に最大値1.0になり、
            // 0または1に近づくほど0に近づく
            const normalizedPenetrationDepth =
              1.0 - Math.abs(penetrationProgress - 0.5) * 2.0

            // 接触点を計算（考え方はsubの時と同様）
            const contactPoint = sphereCenter
              .clone()
              .add(direction.multiplyScalar(sphereRadius))

            shaderMaterial.uniforms.contactPoint.value = contactPoint
            shaderMaterial.uniforms.uContactIntensity.value =
              normalizedPenetrationDepth
            shaderMaterial.uniforms.uHasContact.value = 1.0

            // デバッグ用
            // console.log('接触点:', contactPoint)
          }
          //接触量
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
      if (zennlessZoneSphereRef.current) {
        zennlessZoneSphereRef.current.visible = true
      }

      /**
       * 接触判定バッファに接触部分の色を焼き付ける。
       * そのために、各オブジェクトを黒塗りに変換してレンダリングし、接触部分の色を取得する必要がある。
       * 結果的に接触判定バッファには、接触判定部分が白くなったもののみを焼き付けることができる。（単に接触判定を見たいのなら、shpereに色を出せば済むが、ここでは接触判定部位のみをブラーで広げた絵作りをしたため、こうする。）
       */
      // 各オブジェクトを黒塗りに変換
      if (zennlessZoneSphereRef.current) {
        const zennlessZoneSphereMaterial = zennlessZoneSphereRef.current
          .material as THREE.ShaderMaterial

        zennlessZoneSphereMaterial.uniforms.uRenderContactDitection.value = 1
      }
      if (cubeRef.current) {
        const cubeShaderMaterial = cubeRef.current
          .material as THREE.ShaderMaterial

        cubeShaderMaterial.uniforms.uRenderContactDitection.value = 1
      }
      if (floatingCylinerRef.current) {
        const floatingCylinderShaderMaterial = floatingCylinerRef.current
          .material as THREE.ShaderMaterial

        floatingCylinderShaderMaterial.uniforms.uRenderContactDitection.value = 1
      }
      if (groundRef.current) {
        const groundShaderMaterial = groundRef.current
          .material as THREE.ShaderMaterial

        groundShaderMaterial.uniforms.uRenderContactDitection.value = 1
      }

      if (writeTarget && gl && scene && camera) {
        gl.setRenderTarget(writeTarget)
        gl.render(scene, camera)
        gl.setRenderTarget(null)
      }

      // 各オブジェクトの黒塗りを解除
      if (zennlessZoneSphereRef.current) {
        const zennlessZoneSphereMaterial = zennlessZoneSphereRef.current
          .material as THREE.ShaderMaterial

        zennlessZoneSphereMaterial.uniforms.uRenderContactDitection.value = 0
      }
      if (cubeRef.current) {
        const cubeShaderMaterial = cubeRef.current
          .material as THREE.ShaderMaterial

        cubeShaderMaterial.uniforms.uRenderContactDitection.value = 0
      }
      if (floatingCylinerRef.current) {
        const floatingCylinderShaderMaterial = floatingCylinerRef.current
          .material as THREE.ShaderMaterial

        floatingCylinderShaderMaterial.uniforms.uRenderContactDitection.value = 0
      }
      if (groundRef.current) {
        const groundShaderMaterial = groundRef.current
          .material as THREE.ShaderMaterial

        groundShaderMaterial.uniforms.uRenderContactDitection.value = 0
      }

      // 接触判定パスのテクスチャを交換
      if (contactDitectionPassRef.current) {
        contactDitectionPassRef.current.uniforms.tContactDitectionDiffuse.value =
          readTarget?.texture
      }

      /**
       *各オブジェクトに接触判定領域のテクスチャを割り当て
       */
      //zennlessZoneSphereRefは内部で接触判定を作っているので、ここでの割り当ては不要
      // if (cubeRef.current) {
      //   const cubeShaderMaterial = cubeRef.current
      //     .material as THREE.ShaderMaterial

      //   cubeShaderMaterial.uniforms.tContactDitectionTexture.value =
      //     readTarget?.texture
      // }

      if (floatingCylinerRef.current) {
        const floatingCylinderShaderMaterial = floatingCylinerRef.current
          .material as THREE.ShaderMaterial

        floatingCylinderShaderMaterial.uniforms.tContactDitectionTexture.value =
          readTarget?.texture
      }

      // if (groundRef.current) {
      //   const groundShaderMaterial = groundRef.current
      //     .material as THREE.ShaderMaterial

      //   groundShaderMaterial.uniforms.tContactDitectionTexture.value =
      //     readTarget?.texture
      // }

      /**
       * エフェクトコンポーザーのレンダリング
       */
      gl.setRenderTarget(null)
      composerRef.current?.render(delta)
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
        depthTexture={
          depthAndBackgroundRenderTargetRef.current?.depthTexture || null
        }
        backgroundTexture={
          depthAndBackgroundRenderTargetRef.current?.texture || null
        }
        sphereRadius={sphereRadius}
      />
      {/* 固定された円柱 */}
      <FloatingCylinders floatingCylinerRef={floatingCylinerRef} />
      {/* 動く立方体(接触判定は球体が担う) */}
      <MovingCubes
        movingCubeRef={movingCubeRef}
        collisionSphereRef={collisitonRef}
        cubeRef={cubeRef}
        cubeSize={cubeSize}
        sphereRadius={collisionSphereRadius}
      />
      {/* <DragControls axisLock="y">
      </DragControls> */}
      <Ground groundRef={groundRef} />
    </>
  )
}
