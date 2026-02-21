import express from 'express'
import {userPermissions, userExists, changeUserAdmin, changeUserMember} from '../db/database.ts' 
import {isLogged, isMember, isAdmin, isMemberOrAdmin, currentLogin} from '../auth/auth.service.ts'

const router = express.Router();

//Search the permissions of the user
router.post('/searchUser', async (req, res) => {
  //If user is an Admin:
  try {
    if (isLogged(req) && isAdmin(req)){
      const search_user_exists = await userExists(req.body.search_login);
      //If the user does not exist
      if (!search_user_exists){
       res.status(400).json({
        success: false,
        message: "Erreur : utilisateur inexistant, veuillez attendre que celui-ci se connecte une première fois sur le site du Zik",
      })
       return;
     }
      //Search the permissions
     const perms= await userPermissions(req.body.search_login)
     res.status(201).json({
      success: true,
      message: "Succès",
      data: perms,
    })
     return;

   }else{
    res.status(401).json({
      success: false,
      message: "Erreur : vous n'avez pas l'autorisation",
    })
    return;
  }
}catch(error){
  res.status(500).json({
    success: false,
    message: "Erreur : problème serveur, veuillez vous réessayer plus tard"
  })
  return;
}
})

//The route to change the permissions of a user
router.post('/changePerms', async (req, res) => {
  //If user is an Admin:
  try {
    if (isLogged(req) && isAdmin(req)){
      const user_searched = req.body.login;
      if (currentLogin(req) == user_searched){

        res.status(400).json({
          success: false,
          message: "Erreur : vous ne pouvez pas modifier votre propre rôle",
        })

        return;
      }
      const search_user_exists = await userExists(user_searched);

      //If the user does not exist
      if (!search_user_exists){
        res.status(400).json({
          success: false,
          message: "Erreur : utilisateur inexistant, veuillez attendre que celui-ci se connecte une première fois sur le site du Zik",
        })
        return;
      }
      //If this is not true or false in the frontend boxes
      const new_perm_member = req.body.new_member_perm;
      const new_perm_admin = req.body.new_admin_perm;
      if (! (new_perm_member == true || new_perm_member == false || new_perm_admin == true || new_perm_admin == false)){
        res.status(400).json({
          success: false,
          message: "Erreur : données invalides",
        })
        return;
      }

      changeUserMember(user_searched, new_perm_member);
      changeUserAdmin(user_searched, new_perm_admin);
      res.status(201).json({
        success: true,
        message: "Succès",
      })
      return;

    }else{
      res.status(401).json({
        success: false,
        message: "Erreur : vous n'avez pas l'autorisation",
      })
      return;
    }
  }catch(error){
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Erreur : problème serveur, veuillez vous réessayer plus tard"
    })
    return;
  }
})

export default router;
