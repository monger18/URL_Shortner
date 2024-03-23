const express = require('express')
const path = require('path')
const { connectToMongoDB } = require('./connect')
const URL = require('./models/url')
const cookieParser = require('cookie-parser')

const staticRoute = require('./routes/staticroutes')
const urlRoute = require('./routes/url')
const userRoute = require('./routes/user')
const { restrictToLoggedinUseronly, checkAuth } = require('./middleware/auth')

const app = express()

const PORT = 8001
connectToMongoDB(
  'mongodb+srv://rahulraj18sep200051:2CczBEVHkTryUef4@cluster0.vzy2wgr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
)
  .then(() => console.log('Mongodb connect'))
  .catch((err) => {
    console.log(err)
  })

app.set('view engine', 'ejs')
app.set('views', path.resolve('./views'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/url', restrictToLoggedinUseronly, urlRoute)
app.use('/', checkAuth, staticRoute)
app.use('/user', userRoute)

app.get('/url/:shortId', async (req, res) => {
  const shortId = req.params.shortId
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  )
  res.redirect(entry.redirectURL)
})

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`))
