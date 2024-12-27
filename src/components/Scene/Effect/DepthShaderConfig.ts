import vertexShader from '@/shaders/depth/vertex.glsl'
import fragmentShader from '@/shaders/depth/fragment.glsl'

export const DepthShaderConfig = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 100 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
}
