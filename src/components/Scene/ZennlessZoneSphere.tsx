import React, { useMemo } from 'react'
import * as THREE from 'three'
import fragmentShader from '@/shaders/sphere/fragment.glsl'
import vertexShader from '@/shaders/sphere/vertex.glsl'

interface ZennlessZoneSphereProps {
  zennlessZoneSphereRef: React.MutableRefObject<THREE.Mesh | null>
}

export const ZennlessZoneSphere = ({
  zennlessZoneSphereRef,
}: ZennlessZoneSphereProps) => {
  console.log('re render ZennlessZoneSphere')

  const material = useMemo(() => {
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDepth: { value: null },
        cameraNear: { value: 0 },
        cameraFar: { value: 0 },
        /**
         * 本来ならば、ここのwidth,heigh値はリサイズの度に変更する必要があるが、今回のプロジェクトではtDepthがリサイズの度に初期化されるのはパフォーマンスの観点から好ましくない。当然、コードの書き方を変えればこの問題は回避出来るはずだが、今回はデモシーンということもあり、このままにしておく。gl_FragCoordとuResolutionは初期化時のままで正規化できるから、それで充分。リサイズの度に正規化を再計算するまでもないと判断。
         */
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        }, //よって、gl_fragcoordの正規化に使うだけなので、リサイズは不要...初期化したときのままで、0 -> 1 とできているし、それはリサイズ後も変わらないため。
      },
      fragmentShader,
      vertexShader,
      transparent: true,
      side: THREE.DoubleSide,
    })
    return shaderMaterial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <mesh ref={zennlessZoneSphereRef} material={material}>
      <sphereGeometry args={[2, 32, 32]} />
    </mesh>
  )
}
