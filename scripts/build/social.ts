import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { HtmlTagDescriptor, Plugin } from 'vite'

const NAME = 'Automaton'
const DESCRIPTION =
  "A few simple rules, and something that looks alive. From Conway's Game of Life to Lenia."

const IMAGE = { path: '/assets/social.png', type: 'image/png', width: 1200, height: 630 }

const PUBLIC = resolve(import.meta.dirname, '../../public')

function siteUrl(): URL | null {
  const domain = process.env['VERCEL_PROJECT_PRODUCTION_URL']
  return domain ? new URL(`https://${domain}`) : null
}

function meta(key: 'name' | 'property', value: string, content: string): HtmlTagDescriptor {
  return { tag: 'meta', attrs: { [key]: value, content }, injectTo: 'head' }
}

function socialTags(): HtmlTagDescriptor[] {
  const site = siteUrl()
  const tags = [
    { tag: 'title', children: NAME, injectTo: 'head' } satisfies HtmlTagDescriptor,
    meta('name', 'description', DESCRIPTION),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', NAME),
    meta('property', 'og:title', NAME),
    meta('property', 'og:description', DESCRIPTION),
    meta('property', 'og:locale', 'en_US'),
  ]
  const image = existsSync(resolve(PUBLIC, `.${IMAGE.path}`))
  tags.push(meta('name', 'twitter:card', site && image ? 'summary_large_image' : 'summary'))
  if (!site) return tags
  tags.push(meta('property', 'og:url', site.href))
  if (!image) return tags

  return [
    ...tags,
    meta('property', 'og:image', new URL(IMAGE.path, site).href),
    meta('property', 'og:image:type', IMAGE.type),
    meta('property', 'og:image:width', String(IMAGE.width)),
    meta('property', 'og:image:height', String(IMAGE.height)),
    meta('property', 'og:image:alt', NAME),
  ]
}

export function social(): Plugin {
  return {
    name: 'automaton:social',
    transformIndexHtml: () => socialTags(),
  }
}
