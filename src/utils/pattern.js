export function exportPattern(cells) {
    let pattern = '['

    Object.keys(cells).forEach(cell => {
      const [x,y] = cell.split(':')
      pattern += `[${x},${y}],`
    })

    pattern = pattern.replace(/,\s*$/, ']');
    console.log('> Pattern: ', pattern)
}