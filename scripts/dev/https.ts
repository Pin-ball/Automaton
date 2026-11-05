import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const CERTS = resolve(import.meta.dirname, '../../certs')

function localCertificate(): { cert: Buffer; key: Buffer } | undefined {
  const cert = resolve(CERTS, 'dev.pem')
  const key = resolve(CERTS, 'dev-key.pem')
  if (!existsSync(cert) || !existsSync(key)) return undefined
  return { cert: readFileSync(cert), key: readFileSync(key) }
}

export function https(): Plugin {
  return {
    name: 'automaton:https',
    apply: 'serve',

    config() {
      const certificate = localCertificate()
      return certificate ? { server: { https: certificate } } : {}
    },
  }
}
