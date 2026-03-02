import express from 'express'
import session from 'express-session'
import pgPromise from 'pg-promise'
import cors from 'cors'
import {RedisStore} from 'connect-redis'
import {createClient} from 'redis'
import dotenv from 'dotenv'

const port = process.env.PORT

//DB init 
import {initDB} from './db/database.ts'
initDB();

//Routes
import auth_routes from './routes/auth.routes.ts'
import reservation_routes from './routes/reservation.routes.ts'
import admin_routes from './routes/admin.routes.ts'

const app = express()

//Session
const redisClient = createClient({
  url: 'redis://redis'
});
redisClient.on('error', (err) => console.error('Erreur Redis Client', err)); //Redirection of errors
await redisClient.connect();
const redisStore_var = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

app.use(session({
    store: redisStore_var,
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_ID,
    cookie: {
        secure: false, //PROD : TRUE
        httpOnly: true,
        maxAge: 10*60*1000 // 10 mins
    }
}));


//Middleware
app.use(express.json());
app.set('trust proxy', 1);
app.use(cors({
  origin: 'http://frontend', 
  credentials: true,
}))

app.use('/api', auth_routes)
app.use('/api', reservation_routes)
app.use('/api', admin_routes)

// Test Route
app.get('/', (req, res) => {
  res.send('Backend is ready to use');
});

app.listen(port, () => {
  console.log(`Serveur backend lancé sur le port ${port}`);
});

