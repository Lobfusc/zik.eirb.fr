//BACKEND CONFIG
const backend_search_user = "/api/searchUser";
const backend_change_perms = "/api/changePerms";

function errorMessage(msg){
  alert(msg)
}

export function switchVisManageAdmin(){
  document.getElementById('manageUserForm').toggleAttribute('hidden');
      //Prevent mobile bugs when scrolling with a modal opened
  if (document.body.style.position == ""){
    document.body.style.position = 'fixed';
  }else{
    document.body.style.position = '';
  }
}

export function switchVisManageRes(){
  document.getElementById('manageReservationsForm').toggleAttribute('hidden');
      //Prevent mobile bugs when scrolling with a modal opened
  if (document.body.style.position == ""){
    document.body.style.position = 'fixed';
  }else{
    document.body.style.position = '';
  }
}

//This function is here to search users if it exists, then show their permissions 
//into the checkboxes
export async function searchUser(){
  let login = document.getElementById("manageUserLoginCas").value;
  if (login == ""){
    errorMessage("Veuillez entrer le login CAS dans le champ correspondant");
    return;
  }
  var request = {
    search_login: login,
  }
    //Fetch the values of the form
  try {
    const res = await fetch(backend_search_user, {method: "POST", headers:{"content-type": "application/json"}, credentials: "include", body:JSON.stringify(request) });
    const data = await res.json()
    if (!res.ok){
     errorMessage(data.message);
   }else{
    document.getElementById("isUserMember").checked = data.data.member;
    document.getElementById("isUserAdmin").checked = data.data.admin;
  }
}catch(error){
}
}

//This function validate the form of the manage users
export async function validationOfManageUsers(){
  let login = document.getElementById("manageUserLoginCas").value;
  let new_member_perm = document.getElementById("isUserMember").checked;
  let new_admin_perm = document.getElementById("isUserAdmin").checked;

  if (login == ""){
    errorMessage("Veuillez entrer le login CAS dans le champ correspondant");
    return;
  }

  var request = {
    login: login,
    new_member_perm: new_member_perm,
    new_admin_perm: new_admin_perm, 
  }
    //Fetch the values of the checkboxes
  try {
    const res = await fetch(backend_change_perms, {method: "POST", headers:{"content-type": "application/json"}, credentials: "include", body:JSON.stringify(request) });
    const data = await res.json()
    if (!res.ok){
     errorMessage(data.message);
   }else{
    window.location.reload();
  }
}catch(error){
}
}

