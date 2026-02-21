import express from 'express'
import {isLogged, isMember, isAdmin, isMemberOrAdmin, currentLogin} from '../auth/auth.service.ts'
import {reserve_slot} from '../controller/reservation.controller.ts'
import {delReservation} from '../controller/timetable.controller.ts'
import {getResOnTheDate} from '../db/database.ts'

const router = express.Router();

// Middleware for JSON
router.post('/reservation', async (req, res) => {
  //What we are doing here ? 
  //accepted is after tests of the controller,
  //rsp.msg is the error message
  const rsp = await reserve_slot(req);

  //If all tests are good: 
  if (rsp.accepted === true){
    res.status(201).json({
      success: true,
      message: "Réservation crée",
    })
  }else {
    res.status(401).json({
      success: false,
      message: rsp.msg
    })
  }
})
//Route to get the reservation of the date 
router.get("/getReservationsOnDate", async (req, res) => {
  try {
    const date_filter = req.query.date;
    //Here, we didnt verify injection bc postgres do it and it's okay
    //We call the database
    if (! (isLogged(req) && (isMember(req) || isAdmin(req)))){
      res.status(401).json({
        success: false,
        message: "Erreur : vous n'êtes pas autorisé",
      })
    }
    const obj = await getResOnTheDate(date_filter);
    if (obj.accepted === true){
      res.status(201).json({
        success: true,
        message: "Succès",
        value: obj.value,
      })
    }else{
      res.status(401).json({
        success: false,
        message: obj.msg,
      })
    }
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "Erreur : problème serveur, veuillez réessayer plus tard ",
    })
  }
})
router.get("/deleteReservation", async (req, res) => {
  try {
    //The id of the requested reservation
    const id_filter = Number(req.query.id);
    const obj = await delReservation(id_filter, req);
    if (obj.accepted === true){
      res.status(201).json({
        success: true,
        message: "Succès",
      })
    }else{
      res.status(401).json({
        success: false,
        message: obj.msg,
      })
    }
  } catch (error) {
    console.log(error);
    res.status(501).json({
      success: false,
      message: "Erreur : problème serveur, veuillez réessayer plus tard ",
    })
  }
})

export default router;
