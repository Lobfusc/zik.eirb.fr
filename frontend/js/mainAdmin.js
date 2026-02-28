import {switchVisManageAdmin, switchVisManageRes, searchUser, validationOfManageUsers} from './utils/adminPage/adminPickers.js'
import {userIsLoggedIn, userIsAdmin} from './utils/auth/auth.js'

document.addEventListener("DOMContentLoaded", async ()=>
{
	//If the user is on the planning page, then initialize it
	if (window.location.pathname === '/administration.html'){
    const is_admin = await userIsAdmin();
      //If the user is connected do :
    userIsLoggedIn().then(logged_in =>{
      if (logged_in && is_admin){
        loadAdminPage();
      }else{
        window.location.pathname = "/login.html"
      }
    })
  }

});

function loadAdminPage(){
  document.getElementById('app').toggleAttribute('hidden');
}
closeManageUserForm.addEventListener("click", () =>
{
  switchVisManageAdmin();
});
manageUsers.addEventListener("click", () =>
{
  switchVisManageAdmin();
});
searchUserButton.addEventListener("click", () => {
  searchUser();

});
validateManageUsers.addEventListener("click", ()=>{
  validationOfManageUsers();
})

// -- END ADMIN PAGE -- \\
