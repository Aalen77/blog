import { createApp } from '../server.mjs'

let app

export default async function handler(req, res) {
  if (!app) {
    app = await createApp()
  }
  return app(req, res)
}
