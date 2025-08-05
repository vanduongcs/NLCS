import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

// Collection routes
import accountRoute from './routes/accountRoute.js'
import certificateRoute from './routes/certificateRoute.js'
import courseRoute from './routes/courseRoute.js'
import examRoute from './routes/examRoute.js'
import resultRoute from './routes/resultRoute.js'
import certReceivedRoute from './routes/certReceivedRoute.js'

import accountHistoryRoute from './routes/accountHistoryRoute.js'
import certificateHistoryRoute from './routes/certificateHistoryRoute.js'
import examHistoryRoute from './routes/examHistoryRoute.js'
import courseHistoryRoute from './routes/courseHistoryRoute.js'
import resultHistoryRoute from './routes/resultHistoryRoute.js'

const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    )
  )
  .catch(error =>
    console.error('❌ MongoDB connection error:', error)
  )

app.use('/api/account', accountRoute)
app.use('/api/certificate', certificateRoute)
app.use('/api/course', courseRoute)
app.use('/api/exam', examRoute)
app.use('/api/result', resultRoute)


app.use('/api/accountHistory', accountHistoryRoute)
app.use('/api/certReceived', certReceivedRoute)
app.use('/api/certificateHistory', certificateHistoryRoute)
app.use('/api/examHistory', examHistoryRoute)
app.use('/api/courseHistory', courseHistoryRoute)
app.use('/api/resultHistory', resultHistoryRoute)