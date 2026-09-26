import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { collectIssues, getStoredIssues } from './github.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/issues', async (_request, response, next) => {
  try {
    response.json(await getStoredIssues())
  } catch (error) {
    next(error)
  }
})

app.post('/api/issues/collect', async (_request, response, next) => {
  try {
    response.json(await collectIssues())
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(error.status || 500).json({ error: error.message || 'Internal server error' })
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})