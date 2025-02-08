import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import ExpressMongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 20, // Ограничение: 20 запросов за 15 минут с одного IP
    message: 'Слишком много запросов с этого IP, попробуйте позже',
    headers: true,
});

const { PORT = 3000 } = process.env
const app = express()
const allowedOrigins = 'http://localhost:5173';

app.use(cookieParser())

// app.use(cors())
// app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(limiter);

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
}));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(ExpressMongoSanitize())
app.use(urlencoded({ extended: true }))
app.use(json())

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
