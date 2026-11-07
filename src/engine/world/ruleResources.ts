import { createPackedTexture } from '@src/engine/gl/textures.ts'
import { kernelTaps } from '@src/engine/rules/kernel.ts'
import type { Rule } from '@src/engine/rules/rule.ts'
import { neighborCount } from '@src/engine/rules/rule.ts'
import { countsTable } from '@src/engine/rules/table.ts'
import { EDGE, GROWTH } from '@src/engine/shaders/defines.ts'

type Taps = { key: string; texture: WebGLTexture; count: number }

type Table = { key: string; texture: WebGLTexture; stride: number }

function tapsKey(rule: Rule): string {
  return JSON.stringify([rule.kernel, rule.growth.kind])
}

function tableKey(rule: Rule): string {
  const { kernel, growth } = rule
  return growth.kind === 'counts' ? JSON.stringify([kernel, growth.birth, growth.survive]) : 'none'
}

export class RuleResources {
  private gl: WebGL2RenderingContext
  private taps: Taps
  private table: Table
  private rule: Rule

  constructor(gl: WebGL2RenderingContext, rule: Rule) {
    this.gl = gl
    this.rule = rule
    this.taps = this.createTaps(rule)
    try {
      this.table = this.createTable(rule)
    } catch (error) {
      gl.deleteTexture(this.taps.texture)
      throw error
    }
  }

  update(rule: Rule) {
    this.rule = rule
    if (this.taps.key !== tapsKey(rule)) {
      const taps = this.createTaps(rule)
      this.gl.deleteTexture(this.taps.texture)
      this.taps = taps
    }
    if (this.table.key !== tableKey(rule)) {
      const table = this.createTable(rule)
      this.gl.deleteTexture(this.table.texture)
      this.table = table
    }
  }

  uniforms() {
    const { growth, edge, dt, states } = this.rule
    return {
      uTaps: this.taps.texture,
      uTapCount: this.taps.count,
      uTable: this.table.texture,
      uTableStride: this.table.stride,
      uGrowth: GROWTH[growth.kind],
      uEdge: EDGE[edge],
      uMu: growth.kind === 'bell' ? growth.mu : 0,
      uSigma: growth.kind === 'bell' ? growth.sigma : 1,
      uDt: dt,
      uSteps: Number.isFinite(states) ? states - 1 : 0,
    }
  }

  dispose() {
    this.gl.deleteTexture(this.taps.texture)
    this.gl.deleteTexture(this.table.texture)
  }

  private createTaps(rule: Rule): Taps {
    const { gl } = this
    const taps = kernelTaps(rule.kernel, rule.growth.kind === 'bell')
    const values = new Float32Array(taps.length * 4)
    for (const [i, tap] of taps.entries()) values.set([tap.dx, tap.dy, tap.weight, 0], i * 4)
    return {
      key: tapsKey(rule),
      count: taps.length,
      texture: createPackedTexture(gl, gl.RGBA32F, 4, values),
    }
  }

  private createTable(rule: Rule): Table {
    const { gl } = this
    const { kernel, growth } = rule
    const counts = growth.kind === 'counts' && kernel.shape === 'square'
    const maxCount = counts ? neighborCount(kernel) : 0
    const values = counts
      ? countsTable(maxCount, growth.birth, growth.survive)
      : new Float32Array(2)
    return {
      key: tableKey(rule),
      stride: maxCount + 1,
      texture: createPackedTexture(gl, gl.R32F, 1, values),
    }
  }
}
