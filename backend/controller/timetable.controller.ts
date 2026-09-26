import {isLogged, isMember, isAdmin,currentLogin} from '../auth/auth.service.ts';
import {delResDb,getOwnerByRes} from '../db/database.ts';
export async function delReservation(id_res, req){
  if (!Number.isInteger(id_res)){
    return {accepted : false, msg: "Erreur : paramètre de réservation invalide"}
  }
  if (!(isLogged(req) && (isMember(req) || isAdmin(req)) )){
    return {accepted : false, msg: "Erreur : vous n'avez pas les permissions nécessaires"};
  }

  if (isAdmin(req)){
    //He can Delete all resas
    return delResDb(id_res);
  }else{
    //He can only delete his own 
    let owner_of_resa = await getOwnerByRes(id_res);
    let current_login = currentLogin(req);
    if (owner_of_resa.accepted === true){
      if (owner_of_resa.value == current_login){
        return delResDb(id_res);
      }
    }
    return {accepted : false, msg: "Erreur lors de la suppression"};
  }
}
