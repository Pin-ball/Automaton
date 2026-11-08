type TimerExtension = { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number }

const MAX_PENDING = 8

export class GpuTimer {
  private gl: WebGL2RenderingContext
  private extension: TimerExtension | null
  private pending: WebGLQuery[] = []
  private active: WebGLQuery | null = null
  private latest: number | null = null

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl
    this.extension = gl.getExtension('EXT_disjoint_timer_query_webgl2')
  }

  get milliseconds(): number | null {
    this.collect()
    return this.latest
  }

  begin() {
    if (!this.extension || this.active) return
    this.collect()
    if (this.pending.length >= MAX_PENDING) return
    this.active = this.gl.createQuery()
    this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT, this.active)
  }

  end() {
    if (!this.extension || !this.active) return
    this.gl.endQuery(this.extension.TIME_ELAPSED_EXT)
    this.pending.push(this.active)
    this.active = null
  }

  dispose() {
    this.end()
    for (const query of this.pending) this.gl.deleteQuery(query)
    this.pending = []
  }

  private collect() {
    const { gl, extension } = this
    if (!extension) return
    let disjoint: boolean | null = null
    let query = this.pending[0]
    while (query && gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
      disjoint ??= gl.getParameter(extension.GPU_DISJOINT_EXT)
      if (!disjoint) this.latest = gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6
      gl.deleteQuery(query)
      this.pending.shift()
      query = this.pending[0]
    }
  }
}
