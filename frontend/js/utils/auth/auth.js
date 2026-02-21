const BACKEND_ME = "http://localhost:8080/me"
const BACKEND_LOGIN = "http://localhost:8080/login"

document.addEventListener("DOMContentLoaded", ()=>
{
	if (window.location.pathname === '/login.html'){
    logUser();
  }
});

export async function userIsLoggedIn(){
  let is_co = false;
  try {
    const res = await fetch(BACKEND_ME, { credentials: "include",});
    if (res.ok){ //Ok = true when connected 
      is_co = true; 
    }
    return is_co;

  } catch (error) {
    return is_co;
  }
}
//Log user func redirects to login if the user is not logged in 
export async function logUser(){
  let the_user_logged = await userIsLoggedIn();
  if (!the_user_logged){
    window.location.href = BACKEND_LOGIN;
  }else{
    window.location.pathname = "/index.html";
  }
}
export async function userIsMember(){
  let is_member = false;
  try {
    const res = await fetch(BACKEND_ME, { credentials: "include",});
    const data = await res.json()
    if (res.ok){ //Ok = true when connected 
      if (data.member == true){
        is_member = true;
      }
    }
    return is_member;
  } catch (error) {
    return is_member;
  }

  return 1;
}
export async function userIsAdmin(){
  let is_admin = false;
  try {
    const res = await fetch(BACKEND_ME, { credentials: "include",});
    const data = await res.json()
    if (res.ok){ //Ok = true when connected 
      if (data.admin == true){
        is_admin = true;
      }
    }
    return is_admin;
  } catch (error) {
    return is_admin;
  }
  return 1;
}
export async function getUsername(){
  try {
    const res = await fetch(BACKEND_ME, { credentials: "include",});
    const data = await res.json()
    if (res.ok){ //Ok = true when connected 
      return data.login;
    }
  } catch (error) {
    return -1;
  }
  return -1;
}
