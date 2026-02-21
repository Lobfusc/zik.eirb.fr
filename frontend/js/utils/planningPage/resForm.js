//BACKEND CONFIG
const server = 'http://localhost:8080';
const backend_reserve_a_date = "/reservation";

//CONFIG
const default_hour = 8;
const default_minutes = 0;
const default_min_interval_for_res = 15;

const start_hour = 7;
const end_hour = 22;
const interval_btw_min = 15;

/*
  fetch(server)
  .then(res => res.json())
  .then(data => console.log(data))
*/

//GLOBALS
let hour;
let minutes;
let start_res_hour = null;
let start_res_min = null;

let which_hour_picker;

let end_res_hour = null;
let end_res_min = null;

let date_reservation = null; 

//TODO : REQUEST TO THE BACK TO DISPLAY THE BUTTON
//TODO : Pas plus de 3h de résa pour les membres

function userCanSeeAdminViews(){
	return 1;
}

//Open Reservation Form
export function toogleVisResForm(){
   const date = new Date();
   let day = date.getDate();
   let month_plus_one = date.getMonth()+1;

   if (document.getElementById('modalOverlay').getAttribute('hidden') !== null){
    document.getElementById("resDate").textContent = "Réserver pour le " + day + "/" + month_plus_one;
    document.getElementById("dateReservation").value = date.toISOString().split("T")[0]; // "2026-02-18"
}
document.getElementById('modalOverlay').toggleAttribute('hidden');

    //Prevent mobile bugs when scrolling with a modal opened
if (document.body.style.position == ""){
    document.body.style.position = 'fixed';
}else{
    document.body.style.position = '';
}
}

//To expand if you want to create a personnal opening bubble
function errorMessage(msg){
    alert(msg)
}

export function reserveADate(){

  let res_name = document.getElementById("reservationName").value;
  let is_admin = document.getElementById("adminRes").checked;
  let date_reservation = document.getElementById("dateReservation").value;

  var request = {
      name:res_name,
      date: date_reservation,
      start_res_hour:start_res_hour,
      start_res_min:start_res_min,
      end_res_hour:end_res_hour,
      end_res_min:end_res_min,
      admin:is_admin,
  }
  //First Verification on the front end if not empty 
  if (start_res_hour == null || start_res_min == null || end_res_hour == null || end_res_min == null || res_name == "" || date_reservation == ""){
    errorMessage("Erreur : veuillez remplir tous les champs");
    return false; //For not reloading the page if alerts
}else{
    //Fetch the values of the form
    try {
      fetch(server + backend_reserve_a_date,{
        method : "POST",
        headers:{
          "content-type": "application/json"
      },
      credentials: "include",
      body:JSON.stringify(request)
  }).then(response => { 
    return response.json()
}).then(data => {
  if (data.success){
      window.location.reload();
  }else{
      errorMessage(data.message);
  }
})

} catch (error) {
  console.log(error);
}

}
}

// -- HOUR PICKERS -- \\
//Reservation Form :

//Open hour Picker, start if this is the start Picker, end, if this is the end picker
//We use the same code for both
export function openHourPicker(status){
    //Get an error Message if end hour before start 
    if (status === "end" &&  (start_res_hour == null || start_res_min == null) ){
        errorMessage("Erreur : veuillez choisir une heure de début avant de choisir une heure de fin");
    }else{
        document.getElementById('HourPicker').toggleAttribute('hidden');
        hour = default_hour;
        minutes = default_minutes;

        display_minutes();
        display_hour();
        //Start hour Picker
        if (status === "start"){
            document.getElementById('titleHourPicker').textContent = "Heure de début";
            which_hour_picker = "start"; //Global variable

            //Reinitialize the end picker to prevent bugs of hours
            document.getElementById("endHourPicker").classList.remove('text-left');
            document.getElementById("endHourPicker").classList.add('text-right');
            document.getElementById("endHourPicker").textContent = "⏱";
            
        }
        //End hour Picker
        if (status === "end"){
            document.getElementById('titleHourPicker').textContent = "Heure de fin";
            which_hour_picker = "end";
            if (start_res_hour !== null && start_res_min !== null){
                //initialize to the start hour + default interval 
                hour = start_res_hour;
                minutes = start_res_min;
            }
        }
        display_hour();
        display_minutes();

    }

}

//Toogle visibility for close and open buttons
export function toggleVisHourPicker(){
    document.getElementById('HourPicker').toggleAttribute('hidden');
}


//Refresh the display of hours
function display_hour(){
    //To normalize typing with 2 numbers
    if (hour < 10 ){
        document.getElementById('hour').textContent = '0' + hour;

    }else{
        document.getElementById('hour').textContent = hour;

    }
}

//Refresh the display of minutes
function display_minutes(){
    if (minutes == 0 ){
        document.getElementById('minutes').textContent = '0' + minutes;

    }else{
        document.getElementById('minutes').textContent = minutes;

    }
}

//Functions for refresh the display of the initial reservation form
function refresh_start_label(){
    //Change the display to see on the left
    document.getElementById("startHourPicker").classList.remove('text-right');
    document.getElementById("startHourPicker").classList.add('text-left');

    //Display X:00
    if (start_res_min<10){
        document.getElementById("startHourPicker").textContent = start_res_hour + ":0" + start_res_min; 
    }else{
        document.getElementById("startHourPicker").textContent = start_res_hour + ":" + start_res_min;  
    }

}

function refresh_end_label(){
    //Change the display to see on the left
    document.getElementById("endHourPicker").classList.remove('text-right');
    document.getElementById("endHourPicker").classList.add('text-left');

    //Display X:00
    if (end_res_min<10){
        document.getElementById("endHourPicker").textContent = end_res_hour + ":0" + end_res_min; 
    }else{
        document.getElementById("endHourPicker").textContent = end_res_hour + ":" + end_res_min;  
    }

}
//add 1 Hour
export function addHour() {
    //Patch the bug they think they can reserve after
    if (hour < end_hour-1){
        hour+=1;    
    }
    display_hour();
    display_minutes();
    
}

//add interval_btw_minutes Minute(s)
export function addMinutes() {
    //Block reset mins to 00 if it's under the start res hour
    if (! (minutes == 60 - interval_btw_min && hour == start_res_hour) ){

        if (hour != end_hour){
            minutes+=interval_btw_min;
        }
        if (minutes == 60){
            minutes = 0;
        }
        display_minutes();
        
    }
}

//minusHour
export function minHour() {
    //Block if you want to go before start hour OR if you want to up the Hour to have a minus minutes and then re minus the hour
    if (!((hour==start_res_hour) || (hour-1 == start_res_hour && minutes < start_res_min))){
        if (hour>start_hour){
            hour-=1;
            display_hour(); 
        }

    }
}

//minusMinutes
export function minMinutes() {  
     //Block if you want to go minus the start res min and hour
    if ( !( minutes == start_res_min && start_res_hour == hour) ){
        if (hour != end_hour){
            minutes-=interval_btw_min;
        }

        if (minutes == -1 * interval_btw_min){
            minutes = 60-interval_btw_min;
        }
        display_minutes();

    }
}


//validation of Hour Reservation Modal
export function validateHourPicker(){
	if (which_hour_picker === "start"){
		start_res_hour = hour;
		start_res_min = minutes;
		refresh_start_label();	
	}
	if (which_hour_picker === "end"){
		end_res_hour = hour;
		end_res_min = minutes;	
		refresh_end_label();
	}
  /*
	const actual_date = new Date();
    if (date_reservation == null){
		errorMessage("Veuillez choisir une date de réservation");
	} *///else if (date_reservation == " < date"){
	//	errotMessage("Veuillez choisir une date non passée");
	//else{
  toggleVisHourPicker();
	//}//TODO vérifier que le nom de la réservation n'est pas vide
}
