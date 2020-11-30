const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

require('dotenv').config()

const {
  screenResponse, apiCallResponse,
  navigate, apiCall, copyToClipboard, showToast,
  Screen, Text, Button, Image
} = require('@chatium/json')

const { getChatiumContext, triggerHotReload } = require('@chatium/sdk')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('combined'))

app.get('/', async (req, res) => res.json(
  screenResponse({ data: await Screen({ title: 'Node Template' }, [
      Text({ text: 'Template for developing custom Chatium backends using NodeJS' }),
      Image({ downloadUrl: 'https://chatium.com/chatium.png' }),
      Button({ title: 'Show request info', onClick: navigate('/request') }),
      Button({ title: 'Toast random number 100 ... 500', onClick: apiCall('/random', { min: 100, max: 500 }) }),
    ])})
))

app.get('/request', async (req, res) => {
  try {
    const ctx = getContext(req)
    return res.json(
      screenResponse({ data: await Screen({ title: 'Request info' }, [
          Text({ text: 'Account Id' }),
          Button({ title: ctx.account.id, onClick: copyToClipboard(ctx.account.id), buttonType: 'flat' }),
          Text({ text: 'Account Host' }),
          Button({ title: ctx.account.host, onClick: copyToClipboard(ctx.account.host), buttonType: 'flat' }),
          Text({ text: 'Auth' }),
          Button({ title: ctx.auth.id, onClick: copyToClipboard(ctx.auth.id), buttonType: 'flat' }),
          Button({ title: 'Main page', onClick: navigate('/') }),
        ])})
    )
  } catch (e) {
    return res.json(
      screenResponse({ data: await Screen({ title: 'Request info' }, [
          Text({ text: 'Sign error' }),
          Button({ title: 'Main page', onClick: navigate('/') }),
        ])})
    )
  }
})

app.post('/random', async (req, res) => {
  const number = req.body.min + Math.round(Math.random() * (req.body.max - req.body.min))
  res.json(
    apiCallResponse({ appAction: showToast(number) })
  )
})

console.log(``)
console.log(`Application started:`)

const port = process.env.PORT || 5050
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening at port :${port}`)
  if (process.env.API_KEY && process.env.API_SECRET) {
    triggerHotReload(appCtx).catch(err => console.log('triggerHotReload error:', err));
  }
})

console.log(``)
console.log(`   APP_ENDPOINT = ${process.env.APP_ENDPOINT ? process.env.APP_ENDPOINT : 'undefined (setup .env file)'}`)
console.log(`        API_KEY = ${process.env.API_KEY ? process.env.API_KEY : 'undefined (setup .env file)'}`)
console.log(`     API_SECRET = ${process.env.API_SECRET ? process.env.API_SECRET.slice(0, 10) + 'xXxXxXxXxXxXxXxXxXxXxX' : 'undefined (setup .env file)'}`)
console.log(``)

const appCtx = {
  app: {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
  }
}

function getContext(req) {
  return getChatiumContext(appCtx, req.headers)
}
