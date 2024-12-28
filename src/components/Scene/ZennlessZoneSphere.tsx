import React, { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import fragmentShader from '@/shaders/sphere/fragment.glsl'
import { useThree } from '@react-three/fiber'
import vertexShader from '@/shaders/sphere/vertex.glsl'

interface ZennlessZoneSphereProps {
  zennlessZoneSphereRef: React.MutableRefObject<THREE.Mesh | null>
  depthTexture: THREE.DepthTexture | null
  backgroundTexture: THREE.Texture | null
  sphereRadius: number
}

export const ZennlessZoneSphere = ({
  zennlessZoneSphereRef,
  depthTexture,
  backgroundTexture,
  sphereRadius,
}: ZennlessZoneSphereProps) => {
  /**
   * three.jsの各オブジェクトを取得
   */
  const { camera } = useThree()

  const material = useMemo(() => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDepth: { value: null },
        tBackground: { value: backgroundTexture },
        cameraNear: { value: 0 },
        cameraFar: { value: 0 },
        /**
         * 本来ならば、ここのwidth,heigh値はリサイズの度に変更する必要があるが、今回のプロジェクトではtDepthがリサイズの度に初期化されるのはパフォーマンスの観点から好ましくない。当然、コードの書き方を変えればこの問題は回避出来るはずだが、今回はデモシーンということもあり、このままにしておく。gl_FragCoordとuResolutionは初期化時のままで正規化できるから、それで充分。リサイズの度に正規化を再計算するまでもないと判断。
         */
        uResolution: {
          value: new THREE.Vector2(width, height),
        }, //よって、gl_fragcoordの正規化に使うだけなので、リサイズは不要...初期化したときのままで、0 -> 1 とできているし、それはリサイズ後も変わらないため。
        contactPoint: {
          value: new THREE.Vector3(0, 0, 0),
        },
        uContactIntensity: { value: 0 },
        uHasContact: { value: 0 },
        uTime: { value: 0 },
        uRenderContactDitection: {
          value: 0,
        },
        uFresnelFactor: { value: 8.0 },
        uWaveRadius: { value: 1.0 }, 
        uWaveFrequency: { value: 16.0 }, 
        uWaveAmplitude: { value: 0.15 },
      },
      fragmentShader,
      vertexShader,
      transparent: true,
      side: THREE.DoubleSide,
      // wireframe: true,
    })
    return shaderMaterial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!material || !depthTexture) return

    material.uniforms.tDepth.value = depthTexture
    material.uniforms.tBackground.value = backgroundTexture
    material.uniforms.cameraNear.value = camera.near
    material.uniforms.cameraFar.value = camera.far
  }, [material, depthTexture, backgroundTexture, camera])

  return (
    <mesh ref={zennlessZoneSphereRef} material={material}>
      <sphereGeometry args={[sphereRadius, 100, 100]} />
    </mesh>
  )
}
