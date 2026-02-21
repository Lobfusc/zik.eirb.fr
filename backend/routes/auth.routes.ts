import express from 'express'
import {login, verifyLogin, disconnect} from '../auth/auth.service.ts'
import {userExists, userPermissions, newUser} from '../db/database.ts'


import dotenv from 'dotenv'

const router = express.Router();

router.get('/login', async (req, res) => {
  try {
    const { redirectUrl, code_verifier, state} = await login(`http://localhost:${process.env.PORT}/auth/callback`);
    //Save in the session 
    req.session.code_verifier = code_verifier;
    req.session.state = state;
    //redirect 
    res.redirect(redirectUrl);
    
  } catch (error) {
    res.send("HTTP Error");
  }

});

router.get('/auth/callback', async (req, res) => {
  try {
    //get currentURL 
    const currentURL = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

    //Get the session var
    const codeVerifier = req.session.code_verifier;
    const expectedState = req.session.state;
    //Verify Login with all
    const user = await verifyLogin(currentURL, codeVerifier, expectedState);
    delete req.session.code_verifier;
    delete req.session.state;

    //If the user exists on the DB

    //If the user did not exist;
    const did_the_user_exists = await userExists(user.login);
    if (!did_the_user_exists){
      //We add it in the DB
      newUser(user.login);
    }
    //Fetch to the DB his ranks
    const ranks = await userPermissions(user.login);

    const user_infos = {
      login: user.login,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: ranks.admin,
      member: ranks.member,
    }
    req.session.user = user_infos; //We save the user in SESSION
    req.session.token_id = user.token_id; //and the token id for logout
    res.redirect(process.env.FRONTEND_IP);
  } catch (error) {
    res.send('HTTP Error');
  }
});

//The route for the front to see if the user is connected
router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({error : "Not connected"})
    res.json(req.session.user)
})

//The route for the front to deconnect a user
router.get('/logout', async (req, res) => {
  let redirectTo;
  try { 
    //Disconnection form eirbconnect
    redirectTo = await disconnect(req.session.token_id);
    delete req.session.token_id;

    req.session.destroy(err => {
    res.clearCookie('connect.sid'); //Delete the cookie 
    res.redirect(redirectTo.redirectUrl);
  });
  }catch(error){
  }
});

//After the logout we need a redirect to the front
router.get('/frontend', (req, res)=>{
  res.redirect(process.env.FRONTEND_IP);
})


export default router;

