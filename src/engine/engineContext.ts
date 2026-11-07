import { EngineError } from '@src/engine/errors.ts'
import { createContext } from '@src/engine/gl/context.ts'
import type { Program } from '@src/engine/gl/program.ts'
import { compileProgram } from '@src/engine/gl/program.ts'
import { DEFINES } from '@src/engine/shaders/defines.ts'
import fragment from '@src/engine/shaders/fragment.glsl?raw'
import fullscreen from '@src/engine/shaders/fullscreen.vert?raw'
import step from '@src/engine/shaders/step.frag?raw'
import type { Surface } from '@src/engine/types.ts'

type Disposable = { dispose(): void }

export class EngineContext {
  readonly gl: WebGL2RenderingContext
  readonly programs: { step: Program }
  private surface: Surface
  private vertexArray: WebGLVertexArrayObject
  private worlds = new Set<Disposable>()
  private disposed = false
  private contextLost = false

  constructor(surface: Surface) {
    const gl = createContext(surface)
    try {
      this.programs = {
        step: compileProgram(gl, fullscreen, [fragment, DEFINES, step].join('\n')),
      }
    } catch (error) {
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      throw error
    }
    this.gl = gl
    this.surface = surface
    this.vertexArray = gl.createVertexArray()
    surface.addEventListener('webglcontextlost', this.onLost)
  }

  get lost(): boolean {
    return this.contextLost || this.gl.isContextLost()
  }

  register(world: Disposable) {
    this.worlds.add(world)
  }

  unregister(world: Disposable) {
    this.worlds.delete(world)
  }

  abortReason(): Error | null {
    if (this.disposed) return new EngineError('disposed', 'engine')
    if (this.lost) return new EngineError('contextLost')
    return null
  }

  assertUsable() {
    const reason = this.abortReason()
    if (reason) throw reason
  }

  beginPass(framebuffer: WebGLFramebuffer, width: number, height: number) {
    const { gl } = this
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.viewport(0, 0, width, height)
    gl.disable(gl.SCISSOR_TEST)
    gl.disable(gl.BLEND)
  }

  drawFullscreen() {
    const { gl } = this
    gl.bindVertexArray(this.vertexArray)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.bindVertexArray(null)
  }

  endPass() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
  }

  dispose() {
    if (this.disposed) return
    for (const world of [...this.worlds]) world.dispose()
    this.surface.removeEventListener('webglcontextlost', this.onLost)
    if (!this.lost) {
      const { gl } = this
      gl.deleteProgram(this.programs.step.program)
      gl.deleteVertexArray(this.vertexArray)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    this.disposed = true
  }

  private onLost = () => {
    this.contextLost = true
  }
}
