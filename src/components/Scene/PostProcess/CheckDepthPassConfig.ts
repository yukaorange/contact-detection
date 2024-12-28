import vertexShader from '@/shaders/checkDepth/vertex.glsl'
import fragmentShader from '@/shaders/checkDepth/fragment.glsl'

export const CheckDepthPassConfig = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    cameraNear: { value: 0 },
    cameraFar: { value: 0 }, //far彩度の距離が遠すぎると、深度が極端に大きくなり、扱えないので、適当な値に設定する。
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
}
