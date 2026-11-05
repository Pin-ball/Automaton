const NAME = 'Cellular Automata'
const DESCRIPTION =
  "A Conway's Game of Life simulator: draw, stamp patterns and watch cells evolve."

const IMAGE = { path: '/assets/icon-512.png', type: 'image/png', width: 512, height: 512 }

function siteUrl() {
  const domain = process.env['VERCEL_PROJECT_PRODUCTION_URL']
  return domain ? new URL(`https://${domain}`) : null
}

function meta(key, value, content) {
  return { tag: 'meta', attrs: { [key]: value, content }, injectTo: 'head' }
}

function socialTags() {
  const site = siteUrl()
  const tags = [
    { tag: 'title', children: NAME, injectTo: 'head' },
    meta('name', 'description', DESCRIPTION),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', NAME),
    meta('property', 'og:title', NAME),
    meta('property', 'og:description', DESCRIPTION),
    meta('property', 'og:locale', 'en_US'),
    meta('name', 'twitter:card', 'summary'),
  ]
  if (!site) return tags

  return [
    ...tags,
    meta('property', 'og:url', site.href),
    meta('property', 'og:image', new URL(IMAGE.path, site).href),
    meta('property', 'og:image:type', IMAGE.type),
    meta('property', 'og:image:width', String(IMAGE.width)),
    meta('property', 'og:image:height', String(IMAGE.height)),
    meta('property', 'og:image:alt', NAME),
  ]
}

export function social() {
  return {
    name: 'automaton:social',
    transformIndexHtml: () => socialTags(),
  }
}
