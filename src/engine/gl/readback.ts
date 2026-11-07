import { EngineError } from '@src/engine/errors.ts'
import type { Rect } from '@src/engine/types.ts'

const POLL_DELAY_MS = 1

export function readAttachmentsAsync(
  gl: WebGL2RenderingContext,
  framebuffer: WebGLFramebuffer,
  attachments: readonly number[],
  rect: Rect,
  abortReason: () => Error | null,
): Promise<Float32Array[]> {
  const length = rect.width * rect.height * 4
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer)
  const buffers = attachments.map((attachment) => {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer)
    gl.bufferData(gl.PIXEL_PACK_BUFFER, length * Float32Array.BYTES_PER_ELEMENT, gl.STREAM_READ)
    gl.readBuffer(attachment)
    gl.readPixels(rect.x, rect.y, rect.width, rect.height, gl.RGBA, gl.FLOAT, 0)
    return buffer
  })
  gl.readBuffer(gl.COLOR_ATTACHMENT0)
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null)

  const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
  gl.flush()
  if (!fence) {
    for (const buffer of buffers) gl.deleteBuffer(buffer)
    return Promise.reject(new EngineError('readback', 'no fence'))
  }

  return new Promise((resolve, reject) => {
    const release = () => {
      if (gl.isContextLost()) return
      gl.deleteSync(fence)
      for (const buffer of buffers) gl.deleteBuffer(buffer)
    }

    const fail = (error: Error) => {
      release()
      reject(error)
    }

    const poll = () => {
      const aborted = abortReason()
      if (aborted) return fail(aborted)
      const status = gl.clientWaitSync(fence, 0, 0)
      if (status === gl.WAIT_FAILED) return fail(abortReason() ?? new EngineError('readback'))
      if (status === gl.TIMEOUT_EXPIRED) {
        setTimeout(poll, POLL_DELAY_MS)
        return
      }
      const results = buffers.map((buffer) => {
        const pixels = new Float32Array(length)
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer)
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, pixels)
        return pixels
      })
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null)
      release()
      resolve(results)
    }

    setTimeout(poll, 0)
  })
}
