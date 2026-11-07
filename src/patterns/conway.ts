import { presets } from '@src/engine/index.ts'
import { definePattern } from '@src/patterns/pattern.ts'

export const gosperGun = definePattern({
  id: 'gosper-glider-gun',
  name: 'Gosper glider gun',
  rule: presets.conway,
  period: 30,
  rle: `
    x = 36, y = 9, rule = B3/S23
    24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4b
    obo$10bo5bo7bo$11bo3bo$12b2o!
  `,
})
