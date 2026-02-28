import pgPromise from 'pg-promise'
import dotenv from 'dotenv'
import sanitizeHtml from 'sanitize-html';

//We do this bc dotenv starts after this script 
let pgp;
let url;
let db;

export function initDB(){
  pgp = pgPromise({/*Options*/})
  url = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_SERVER}:${process.env.POSTGRES_PORT}/zik`
  db = pgp(url)
  //execute()
}
//async function execute(){
//  const data = await db.any('SELECT * FROM users')
//  console.log(data);
//}
//-- ADMIN DATABASE --
export async function userExists(login){
  let login_san = "";
  login_san = sanitizeHtml(login);
  try{
    const data = await db.any('SELECT COUNT(login_cas) FROM users WHERE login_cas=$1;', [login_san])
    return data[0].count == 1;
  }catch(error){
    return false;
  }
}
//returns if this is an admin
export async function userPermissions(login){
  let login_san = "";
  login_san = sanitizeHtml(login);
  try {
    const data = await db.any('SELECT admin,member FROM users WHERE login_cas=$1;', [login_san]);
    return {
      "member": data[0].member,
      "admin": data[0].admin,
    }
  } catch (error) {
    return; 
  }
}
//Add the new user, verify if it does not exists,
export async function newUser(login){
  let login_san = "";
  login_san = sanitizeHtml(login);
  const login_exists = await userExists(login_san)

  if (!login_exists){
    try{
      const data = await db.none("INSERT INTO users(login_cas) VALUES($1);", [login_san]);
      return true;
    }catch(error){
      return false;
    }
  }
  return false;
}
//The login will be (bool) member (yes or no)
export async function changeUserMember(login, bool){
  let login_san = "";
  login_san = sanitizeHtml(login);
  const login_exists = await userExists(login_san)
  if (login_exists){
    try{
      const data = await db.none("UPDATE users SET member=$1 WHERE login_cas=$2;", [bool, login_san]);
      return true;
    }catch(error){
      return false;
    }
  }
  return false;
}
//The login will be (bool) admin (yes or no)
export async function changeUserAdmin(login, bool){
  let login_san = "";
  login_san = sanitizeHtml(login);
  const login_exists = await userExists(login_san)

  if (login_exists){
    try{
      const data = await db.none("UPDATE users SET admin=$1 WHERE login_cas=$2;", [bool, login_san]);
      return true;
    }catch(error){
      return false;
    }
  }
  return false;
}

async function shrinkRes(request, data){
  const admin_start_time = new Date(request.start_time);
  const admin_end_time = new Date(request.end_time);

  for (const element of data){
    try {
      let member_start_time = new Date(element.start_date);
      let member_end_time = new Date(element.end_date);
      //First Case : the member reservation is replaced integrally by the admin one, or they are equal
      if (member_start_time>=admin_start_time && member_end_time<=admin_end_time){
        const data = await db.none("DELETE FROM timetable WHERE id=$1", element.id);
      }

      //Second Case : the member reservation has to be modified by the down
      if (member_start_time<=admin_start_time && member_end_time<=admin_end_time){
        const data = await db.none("UPDATE timetable SET end_date=$1 WHERE id=$2", [admin_start_time, element.id])
      }
      //Third Case : the member reservation has to be modified by the up
      if (member_start_time>=admin_start_time && member_end_time>=admin_end_time){
        const data = await db.none("UPDATE timetable SET start_date=$1 WHERE id=$2", [admin_end_time, element.id])
      }

      //Last Case : if the member reservation is bigger than the admin one
      if (member_start_time<admin_start_time && member_end_time>admin_end_time){
        //Delete it and recreate two 
        const data = await db.none("DELETE FROM timetable WHERE id=$1", element.id);
        const data2 = await db.none("INSERT INTO timetable(name,start_date,end_date,id_user,res_admin) VALUES($1,$2,$3,$4,$5);", [request.name, request.start_time,admin_start_time,id.id_user,request.admin]);
        const data3 = await db.none("INSERT INTO timetable(name,start_date,end_date,id_user,res_admin) VALUES($1,$2,$3,$4,$5);", [request.name, admin_end_time,request.end_time,id.id_user,request.admin]);
      }

    } catch (error) {
      return; 
    }
  }
}

//-- PLANNING PAGE --
export async function createReservation(request){
  try{
    //The database verifies that the resrvation can be put in the tsrange
    //if the user is admin; shrink the existant resa
    if (request.admin == true){
      const data = await db.any("SELECT * FROM timetable WHERE tsrange(start_date, end_date) && tsrange($1,$2)", [request.start_time, request.end_time])
      //Modify for the admin res
      await shrinkRes(request, data);
    }
    const id = await db.one("SELECT id_user FROM users WHERE login_cas=$1;", [request.login]);
    const data = await db.none("INSERT INTO timetable(name,start_date,end_date,id_user,res_admin) VALUES($1,$2,$3,$4,$5);", [request.name, request.start_time,request.end_time,id.id_user,request.admin]);
    return {accepted: true, msg:"Réservation réussie"};
  }catch(error){
    return {accepted: false, msg:"Erreur : réservation invalide, veuillez vérifier que la plage de réservation est libre"};
  }

  return {accepted: false, msg: "Erreur : veuillez essayer de vous reconnecter"}
}

export async function getResOnTheDate(date){
  try {
    date = new Date(sanitizeHtml(date));
    const reservations_of_the_date = await db.query("SELECT id, timetable.id_user, login_cas, name,start_date, end_date,timetable.res_admin FROM timetable JOIN users ON users.id_user=timetable.id_user WHERE start_date::date = $1 ;", date);
    return {accepted: true, msg: "Succès", value: reservations_of_the_date};
    
  } catch (error) {
    return {accepted: false, msg: "Erreur : problème lors de la récupération des réservations", value:""}
    
  }
  return {accepted: false, msg: "Erreur : problème lors de la récupération des réservations", value:""}

}
export async function getOwnerByRes(id_res){
  try {
    let owner = await db.one("SELECT users.login_cas FROM timetable JOIN users ON timetable.id_user = users.id_user WHERE id=$1", id_res);
    return {accepted: true, msg:"Succès", value:owner.login_cas};
  } catch (error) {
    return {accepted: false, msg:"Erreur : problème lors de la réservation", value:""};
  }
  return {accepted: false, msg:"Erreur : problème lors de la réservation", value:""};
}
export async function delResDb(id_res){
  try {
    const data = db.none("DELETE FROM timetable WHERE id=$1", id_res)
    return {accepted: true, msg:""};
  } catch (error) {
    return {accepted: false, msg: "Erreur : problème lors de la suppression"}
  }
}
