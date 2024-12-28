import vertexShader from '@/shaders/contactDitection/vertex.glsl'
import fragmentShader from '@/shaders/contactDitection/fragment.glsl'

export const ContactDitectionPassConfig = {
  uniforms: {
    tDiffuse: { value: null },
    tContactDitectionDiffuse: { value: null },
    uTime: { value: 0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
}
