import { presets } from '@src/engine/index.ts'
import { definePattern } from '@src/patterns/pattern.ts'

export const glider = definePattern({
  id: 'glider',
  name: 'Glider',
  rule: presets.conway,
  period: 4,
  rle: 'x = 3, y = 3, rule = B3/S23\nbo$2bo$3o!',
})

export const blinker = definePattern({
  id: 'blinker',
  name: 'Blinker',
  rule: presets.conway,
  period: 2,
  rle: 'x = 3, y = 1, rule = B3/S23\n3o!',
})

export const block = definePattern({
  id: 'block',
  name: 'Block',
  rule: presets.conway,
  period: 1,
  rle: 'x = 2, y = 2, rule = B3/S23\n2o$2o!',
})

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
