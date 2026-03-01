import {userIsLoggedIn, userIsMember, userIsAdmin} from './auth.js'

let the_user_member;
let the_user_logged;
let the_user_admin;
async function initUser() {
  the_user_logged = await userIsLoggedIn();
  the_user_member = await userIsMember();
  the_user_admin = await userIsAdmin();
}

initUser().then( () => {
  //If the user is just logged; hide the login button and show the logout
  if (the_user_logged){
    Array.from(document.getElementsByClassName("mustDisconnected")).forEach(element => {
      element.toggleAttribute('hidden')
    });

    Array.from(document.getElementsByClassName("mustConnected")).forEach(element => {
      element.toggleAttribute('hidden')
    });

  }

  //If the user is member, we can show the buttons
  if (the_user_logged && (the_user_member || the_user_admin) ){
    Array.from(document.getElementsByClassName("mustMember")).forEach(element => {
      element.toggleAttribute('hidden')
    });
  }
  //If the user is admin same
  if (the_user_logged && the_user_admin){
    Array.from(document.getElementsByClassName("mustAdmin")).forEach(element => {
      element.toggleAttribute('hidden')
    });
  }
});

