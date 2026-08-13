import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dir, '../..')
const examplePath = resolve(root, '.env.example')
const envPath = resolve(root, '.env')

if (existsSync(envPath)) {
  process.exit(0)
}

if (!existsSync(examplePath)) {
  console.error('Missing .env.example — cannot create .env')
  process.exit(1)
}

copyFileSync(examplePath, envPath)
console.log('Created .env from .env.example — fill in your values before continuing')
