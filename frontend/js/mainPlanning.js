import '../assets/style.css'
//At the moment we use main.js to create the planning, but at least it will be located on a planning.js file
import {initializePlanning, addOneWeek, minusOneWeek} from './utils/planningPage/planningView.js'
import {toogleVisResForm, openHourPicker, toggleVisHourPicker, addHour, addMinutes, minHour, minMinutes, validateHourPicker, reserveADate} from './utils/planningPage/resForm.js'
import {userIsLoggedIn, userIsMember, userIsAdmin} from './utils/auth/auth.js'

//Planning : intialize
document.addEventListener("DOMContentLoaded", async ()=>
{
	//If the user is on the planning page, then initialize it
	if (window.location.pathname === '/planning.html'){ 
		const is_member = await userIsMember();
		const is_admin = await userIsAdmin();

      //If the user is connected do :
		const logged_in = await userIsLoggedIn();
		if (logged_in && (is_member || is_admin)){
			await initializePlanning();
		}else{
			window.location.pathname = "/login.html"
		}
      //Show the button admin resa
		if (is_admin){
			document.getElementById("adminResHidden").toggleAttribute('hidden');
		}
	}

});

//Planning : Add one week
addOneWeekButton.addEventListener("click", async ()=>
{
	await addOneWeek();	

});


//Planning : Minus one week
minusOneWeekButton.addEventListener("click", async ()=>
{
	await minusOneWeek();

});

//Planning : Reserve a slot modal
reserveSlot.addEventListener("click", ()=>
{
	toogleVisResForm();
});

closeModalBtn.addEventListener("click", ()=>
{
	toogleVisResForm();

});

submitResForm.addEventListener("click", ()=>
{
	reserveADate();
});



// -- PLANNING PAGE HOUR PICKER -- \\

//Open start Hour selection
startHourPicker.addEventListener("click", ()=>
{
	openHourPicker("start");

});

//Open end Hour selection
endHourPicker.addEventListener("click", ()=>
{
	openHourPicker("end");

});

//Close Hour picker
closeHourPicker.addEventListener("click", ()=>
{
	toggleVisHourPicker();
});

//Add Hour
plusHour.addEventListener("click", ()=>
{
	addHour();
});

//Add Minutes
plusMinutes.addEventListener("click", ()=>
{
	addMinutes();
});

//Minus Hours
minusHour.addEventListener("click", ()=>
{
	minHour();
});

//Minus Minutes
minusMinutes.addEventListener("click", ()=>
{
	minMinutes();
});
//Validate the choice of hour/minutes
validationPicker.addEventListener("click", ()=> 
{
	validateHourPicker();	
});

// -- END PLANNING PAGE HOUR PICKER -- \\
// -- END PLANNING PAGE -- \\


