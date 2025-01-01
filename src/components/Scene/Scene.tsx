import React, { useCallback, useRef } from 'react'
import { Ground } from './Ground/Ground'
import { ZennlessZoneSphere } from './ZennlessZoneSphere/ZennlessZoneSphere'
import { MovingCubes } from './MovingCubes/MovingCubes'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SMAAPass, ShaderPass } from 'three/examples/jsm/Addons.js'
import { CheckDepthPassConfig } from './PostProcess/CheckDepthPassConfig'
import { ContactDitectionPassConfig } from './PostProcess/ContactDitectionPassConfig'

import { useEffect } from 'react'

import { FloatingCylinders } from './FloatingCylinders/FloatingCylinders'

type Contact = {
  point: THREE.Vector3
  intensity: number
}

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
  const cubeRefs = useRef<(THREE.Mesh | null)[]>([])
  const collisionSphereRefs = useRef<(THREE.Mesh | null)[]>([])
  const groupRefs = useRef<(THREE.Group | null)[]>([])
  const groundRef = useRef<THREE.Mesh | null>(null)
  const floatingCylinerRefs = useRef<(THREE.Mesh | null)[]>([])

  /**
   * シーンに配置するオブジェクトの設定
   */
  //シリンダー
  const cylinderConfigs = [
    {
      position: [1.05, 2.42, 0.3] as [number, number, number],
      rotation: [Math.PI / 6, Math.PI / 9, -Math.PI / 5] as [
        number,
        number,
        number,
      ],
      segments: 16,
      radius: 0.42,
    },
    {
      position: [1.5, 1.75, -0.1] as [number, number, number],
      rotation: [Math.PI / 8, Math.PI / 4, -Math.PI / 3] as [
        number,
        number,
        number,
      ],
      segments: 16,
      radius: 0.3,
    },
    {
      position: [-0.5, 1.5, 1.65] as [number, number, number],
      rotation: [Math.PI / 2, -Math.PI / 3, Math.PI / 5] as [
        number,
        number,
        number,
      ],
      radius: 0.42,
      height: 1.5,
      segments: 4,
    },
    {
      position: [-0.9, 1.7, 0.9] as [number, number, number],
      rotation: [-Math.PI / 8, Math.PI / 4, Math.PI / 3] as [
        number,
        number,
        number,
      ],
      radius: 0.4,
      height: 1.5,
      segments: 4,
    },
  ]
  //cube
  const cubeConfigs = [
    //表面を周遊
    {
      position: [0, 1.0, 0] as [number, number, number],
      size: 0.75,
      animation: {
        type: 'circular' as const,
        enabled: true,
        plane: 'xz' as const,
        radius: 2.0,
        speed: 0.75,
        phase: 0,
        rotationEnabled: true,
        rotationSpeed: [0.01, 0.01, 0] as [number, number, number],
      },
    },
    {
      position: [1.0, 1.0, 0] as [number, number, number],
      size: 0.75,
      animation: {
        type: 'circular' as const,
        enabled: true,
        plane: 'xz' as const,
        radius: 2.0,
        speed: 0.75,
        phase: Math.PI,
        rotationEnabled: true,
        rotationSpeed: [0.01, 0.01, 0] as [number, number, number],
      },
    },
    //ピストン運動
    {
      position: [0.0, 1, 0.0] as [number, number, number],
      size: 0.5,
      animation: {
        type: 'linear' as const,
        enabled: true,
        axis: 'z',
        amplitude: 2.250, // 振幅（移動量）
        frequency: 0.5, // 周波数（速さ）
        phase: 0, // 位相（開始位置のオフセット）
        rotationEnabled: true,
        rotationSpeed: [0.02, 0.02, 0.0] as [number, number, number],
      },
    },
    {
      position: [0.0, 1, 0.0] as [number, number, number],
      size: 0.75,
      animation: {
        type: 'linear' as const,
        enabled: true,
        axis: 'x',
        amplitude: 2.50, // 振幅（移動量）
        frequency: 0.75, // 周波数（速さ）
        phase: 0, // 位相（開始位置のオフセット）
        rotationEnabled: true,
        rotationSpeed: [0.01, 0.01, 0.0] as [number, number, number],
      },
    },
    // {
    //   position: [0.0, 1, 1.0] as [number, number, number],
    //   size: 0.5,
    //   animation: {
    //     type: 'circular' as const,
    //     enabled: true,
    //     plane: 'xz' as const,
    //     radius: 1.5,
    //     speed: 0.25,
    //     phase: ((Math.PI * 2) / 4) * 3,
    //     rotationEnabled: true,
    //     rotationSpeed: [0.01, 0.01, 0] as [number, number, number],
    //   },
    // },
    // {
    //   position: [0.0, 1, -1.0] as [number, number, number],
    //   size: 0.75,
    //   animation: {
    //     type: 'circular' as const,
    //     enabled: true,
    //     plane: 'xz' as const,
    //     radius: 1.5,
    //     speed: 0.75,
    //     phase: ((Math.PI * 2) / 4) * 4,
    //     rotationEnabled: true,
    //     rotationSpeed: [0.01, 0.01, 0] as [number, number, number],
    //   },
    // },
  ]

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
   * リサイズ処理
   */
  const handleResize = useCallback(() => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
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
   * useEffectで初期設定を行う
   */
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio, 1.5)
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
      0.2, //strength
      0.01, //radius
      0.01, //threshold
    )

    //-------低負荷ジャギー軽減処理
    const smaaPass = new SMAAPass(width, height)

    if (camera) {
      //深度を取得するために、カメラの視錐台のニアサイドとファーサイドを設定
      CheckDepthPass.uniforms.cameraNear.value = camera.near
      CheckDepthPass.uniforms.cameraFar.value = camera.far
    }

    /**
     * コンポーザーにパスを追加
     */
    effectComposer.addPass(renderPass)
    //深度を確認するときだけ有効にする
    // effectComposer.addPass(CheckDepthPass)
    //接触判定の色を付与（板ポリではなく、オブジェクトで使いたいから、いまはコメントアウト）
    // effectComposer.addPass(contactDitectionPass)
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
   * ループ処理内で使用するヘルパー関数を作成
   */

  // シェーダーマテリアルへの操作
  const setShaderUniform = (
    mesh: THREE.Mesh | null,
    uniformName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    if (mesh) {
      const material = mesh.material as THREE.ShaderMaterial
      material.uniforms[uniformName].value = value
    }
  }
  // 複数のメッシュに対してuniform操作を行う
  const setUniformsForMeshes = (
    meshes: (THREE.Mesh | null)[],
    uniformName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    meshes.forEach((mesh) => setShaderUniform(mesh, uniformName, value))
  }

  /**
   * ループ処理
   */
  useFrame(
    (_, delta) => {
      // 書き込み用と読み込み用のバッファ
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
      if (zennlessZoneSphereRef.current) {
        //マテリアルの準備
        const shaderMaterial = zennlessZoneSphereRef.current
          .material as THREE.ShaderMaterial

        //中央の球体のワールド座標を格納する変数
        const sphereCenter = new THREE.Vector3()
        //中央の球体のワールド座標をsphereCenterに格納
        zennlessZoneSphereRef.current.getWorldPosition(sphereCenter)

        const contacts: Contact[] = []

        collisionSphereRefs.current.forEach((collisionSphere) => {
          if (!collisionSphere) return

          const collisionCenter = new THREE.Vector3()

          //接触判定用の球体のワールド座標を取得
          collisionSphere.getWorldPosition(collisionCenter)

          //接触判定用の球体の中心から中央の球体の中心へのベクトルを取得
          //subは呼び出し元のベクトルを変更するので、clone()してから呼び出す。collisionCenterからsphereCenterへの正規化ベクトルを取得
          const direction = collisionCenter
            .clone()
            .sub(sphereCenter)
            .normalize()
          //中央の球体と接触判定用の球体の中心との距離を取得
          const distance = collisionCenter.distanceTo(sphereCenter)
          //中央の球体の半径と接触判定用の球体の半径の和を取得
          const totalRadius = sphereRadius + collisionSphereRadius

          // 接触が発生している場合のみ接触点を計算
          if (distance < totalRadius) {
            // 完全にめり込んだ状態（内側に収まった状態）をチェック
            if (distance <= Math.abs(sphereRadius - collisionSphereRadius)) {
              // 完全にめり込んだ状態では接触なし
              return
            }

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

            contacts.push({
              point: contactPoint,
              intensity: normalizedPenetrationDepth,
            })
          }

          const numContacts = Math.min(contacts.length, 4)

          // 接触点の数を格納
          shaderMaterial.uniforms.uNumContacts.value = numContacts

          // 接触点配列を更新
          for (let i = 0; i < 4; i++) {
            if (i < contacts.length) {
              // 接触点の座標を格納
              shaderMaterial.uniforms.uContactPoints.value[i].copy(
                contacts[i].point,
              )
              // 接触点の強度を格納
              shaderMaterial.uniforms.uContactIntensities.value[i] =
                contacts[i].intensity
            } else {
              // 接触点が存在しない場合は0で初期化
              shaderMaterial.uniforms.uContactPoints.value[i].set(0, 0, 0)
              // 接触点の強度を0で初期化
              shaderMaterial.uniforms.uContactIntensities.value[i] = 0
            }
          }
        })

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
       *各オブジェクトに接触判定領域の色を書き込むバッファのテクスチャを割り当て
       */
      //※ zennlessZoneSphereRefは内部で接触判定を作っているので、ここでの割り当ては不要
      //※ 浮遊するシリンダーの表面に接触判定に応じたグリッドを表示する。以下同様
      //※ また、ここでreadバッファをマテリアルに割り当てる。後述の接触部分の色をバッファに焼き付ける作業よりも後にreadバッファの割り当てを行うと、フィードバックループが発生してしまう。

      floatingCylinerRefs.current.forEach((cylinder) => {
        setShaderUniform(
          cylinder,
          'tContactDitectionTexture',
          readTarget?.texture,
        )
      })

      //cube
      cubeRefs.current.forEach((cube) => {
        setShaderUniform(cube, 'tContactDitectionTexture', readTarget?.texture)
      })

      // Ground
      if (groundRef.current) {
        setShaderUniform(
          groundRef.current,
          'tContactDitectionTexture',
          readTarget?.texture,
        )
      }

      /**
       * 接触判定バッファに接触部分の色を焼き付ける。
       * そのために、各オブジェクトを黒塗りに変換してレンダリングし、接触部分の色を取得する必要がある。
       * 結果的に接触判定バッファには、接触判定部分が白くなったもののみを焼き付けることができる。（単に接触判定を見たいのなら、shpereに色を出せば済むが、ここでは接触判定部位のみをブラーで広げた絵作りをしたため、こうする。）
       */
      // 各オブジェクトを黒塗りに変換
      //sphere
      setShaderUniform(
        zennlessZoneSphereRef.current,
        'uRenderContactDitection',
        1,
      )
      // 複数のシリンダー
      setUniformsForMeshes(
        floatingCylinerRefs.current,
        'uRenderContactDitection',
        1,
      )
      // Cubes
      setUniformsForMeshes(cubeRefs.current, 'uRenderContactDitection', 1)
      // Ground
      setShaderUniform(groundRef.current, 'uRenderContactDitection', 1)

      //接触部分の色をバッファに焼き付ける
      if (writeTarget && gl && scene && camera) {
        gl.setRenderTarget(writeTarget)
        gl.render(scene, camera)
        gl.setRenderTarget(null)
      }

      // 各オブジェクトの黒塗りを解除
      //sphere
      setShaderUniform(
        zennlessZoneSphereRef.current,
        'uRenderContactDitection',
        0,
      )
      // 複数のシリンダー
      setUniformsForMeshes(
        floatingCylinerRefs.current,
        'uRenderContactDitection',
        0,
      )
      // Cubes
      setUniformsForMeshes(cubeRefs.current, 'uRenderContactDitection', 0)
      //ground
      setShaderUniform(groundRef.current, 'uRenderContactDitection', 0)

      /**
       * エフェクトコンポーザーのレンダリング
       */
      composerRef.current?.render(delta)

      // バッファの交換を行う
      writeBufferIndexRef.current = writeBufferIndexRef.current === 0 ? 1 : 0
    },
    /**
     * EffectComposerは、シーンが更新された後、画面に実際に描画される前にレンダーパスを実行する必要がある。useFrameの第二引数を他のコンポーネントよりも大きな数字（つまり後回し）に設定することで、React Three Fiberがシーンを更新した後、かつ最終的な描画呼び出しの前にEffectComposerがレンダリングされることを保証できる。
     * 今回のプロジェクトでは、シーンに配置したオブジェクトそれぞれでuseFrameを使用しており、それらの第二引数には値は入れていない。そのため、ここでの第二引数は1としている。
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
      <FloatingCylinders
        floatingCylinerRefs={floatingCylinerRefs}
        configs={cylinderConfigs}
      />
      {/* 動く立方体(接触判定は球体が担う) */}
      <MovingCubes
        cubeRefs={cubeRefs}
        collisionSphereRefs={collisionSphereRefs}
        groupRefs={groupRefs}
        configs={cubeConfigs}
        sphereRadius={collisionSphereRadius}
      />
      {/* ground */}
      <Ground groundRef={groundRef} />
    </>
  )
}
