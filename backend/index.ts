import express from 'express'
import session from 'express-session'
import pgPromise from 'pg-promise'
import cors from 'cors'

import dotenv from 'dotenv'
dotenv.config({path : "process.env"}) //Environement variables

const port = process.env.PORT

//DB init 
import {initDB} from './db/database.ts'
initDB();

//Routes
import auth_routes from './routes/auth.routes.ts'
import reservation_routes from './routes/reservation.routes.ts'
import admin_routes from './routes/admin.routes.ts'

const app = express()
//TODO : Problems with express session in prod
app.use(session({
  secret: process.env.COOKIE_ID,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false, //PROD : TRUE
    maxAge: 10*60*1000 //10 mins
  }

}))

//Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}))

app.use('/', auth_routes) //TODO : get /api
app.use('/', reservation_routes)
app.use('/', admin_routes)

// Test Route
app.get('/', (req, res) => {
  res.send('Backend is ready to use');
});

app.listen(port, () => {
  console.log(`Serveur backend lancé sur http://localhost:${port}`);
});

