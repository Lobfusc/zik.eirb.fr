import DOMPurify from 'dompurify';
import {getUsername, userIsAdmin} from '../auth/auth.js';
//This is the date of the current session
let ACTUAL_DISPLAY_DATE = new Date();
const BACKEND_RES = "/api/getReservationsOnDate"
const BACKEND_DEL_RES = "/api/deleteReservation"

//Little Doc : 
//it works : 
//-> someone adds a reservation, backend etc.
//-> the timetable is just a fixed grid where we clear all the childs, and mooves the dates
//on each click, it searchs the backend reservations. and clear the grid for the new one.

//The function gives the monday of the week
function getMondayOfTheWeek(d){
	let date = new Date(d);

	let actual_day = date.getDay();
	if (actual_day === 0){
		actual_day = 7;

	}
	//Now 1 -- 7 for dates
	date.setDate(date.getDate()-(actual_day-1))	;
	return date; 
}

async function deleteReservation(id_res){
  try {
    const res = await fetch(BACKEND_DEL_RES + `?id=${id_res}`, { credentials: "include",});
    const data = await res.json();
    if (res.ok){
      window.location.reload();
    }
  } catch (error) {
    return; 
  }
}

//This function create the right display with the right dates on the planning
async function initializeDaysOnTimeTable(monday_date){
	const id_days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

	let date_current_day = new Date(monday_date);

	document.getElementById(id_days[0]).textContent = id_days[0] + " " + date_current_day.getDate();
  await displayReservationsOfTheDate(date_current_day, 1);
  for (let i = 1; i<id_days.length; i = i+1){
    date_current_day.setDate(date_current_day.getDate() + 1);
    document.getElementById(id_days[i]).textContent = id_days[i] + " " + date_current_day.getDate();
    await displayReservationsOfTheDate(date_current_day, i+1);

  }
}
//This function fetchs the backend to have the reservations of a specific day
//(date,day) : the date for the fetch and the day to display on the right column in the frontend
async function displayReservationsOfTheDate(date, day){
  try {
    const new_date = new Date(date);
    const res = await fetch(BACKEND_RES + `?date=${new_date}`, { credentials: "include",});
    const data = await res.json();
    const client_username = await getUsername();
    const is_client_admin = await userIsAdmin();
    if (res.ok){ //Ok when no problem
      //Here data is the actual of the day 
      
      //the frontend has for id for each day day:{numberOfTheDay 1-> 7}
      data.value.forEach(element => {
       const container_ol = document.getElementById(`day:${day}`);

        //We extract the informations of the date. Maybe it's easier to save in DB the start... but idk
       const start_date_el = new Date(element.start_date);
       const end_date_el = new Date(element.end_date);

        //Get hours and minutes
       const start_hour = start_date_el.getHours();
       const start_minutes = start_date_el.getMinutes();

       const end_hour = end_date_el.getHours();
       const end_minutes = end_date_el.getMinutes();

        //display_.. is for the minutes with 00
       let display_start_minutes = new String(start_minutes);
       let display_end_minutes = new String(end_minutes);

       if (end_minutes == 0){
        display_end_minutes = "00";
      }
      if (start_minutes == 0){
        display_start_minutes = "00";
      }

        //The CSS grid with the right start and end date
      let char_start_end = `--start:${start_hour}${display_start_minutes} ; --end:${end_hour}${display_end_minutes} ;`
      char_start_end = DOMPurify.sanitize(char_start_end);

      let new_li = document.createElement('li');

        //If the res is admin, then change the color 
      if (element.res_admin){
        new_li.classList = "session-admin"
      }else{
        new_li.classList = "session";
      }
      new_li.setAttribute("style", char_start_end);
      
      let new_X_button = document.createElement('span');

        //Display the button if this is the owner, we verify the request with the backend afterwards
      if (String(client_username) == String(element.login_cas) || is_client_admin){
          //The X buttons
        new_X_button.classList = "delete-button ";
        new_X_button.textContent = "X";
        new_X_button.addEventListener("click", () => {
          deleteReservation(element.id);
        })
      }

        //The Title with the hours
      let display_hour = `${start_hour}:${display_start_minutes} - ${end_hour}:${display_end_minutes}`
      display_hour = DOMPurify.sanitize(display_hour);
      let new_clock = document.createElement('span');
      new_clock.classList = "time text-yellow-100";
      new_clock.textContent = display_hour;

        //The title of the Reservation
      let display_title = element.name;
      display_title = DOMPurify.sanitize(display_title);
      let new_title = document.createElement('h3');
      new_title.textContent = display_title;

        //The owned by 
      let display_owner = element.login_cas;
      display_owner = DOMPurify.sanitize(display_owner);
      let new_res_owner = document.createElement('p');
      new_res_owner.classList = "text-gray-300";

      if (element.res_admin){
        new_res_owner.textContent = `Réservé par ${display_owner} (ADMIN)`;
      }else{
        new_res_owner.textContent = `Réservé par ${display_owner}`;
      }

      
      
      new_li.appendChild(new_X_button);
      new_li.appendChild(new_clock);
      new_li.appendChild(new_title);
      new_li.appendChild(new_res_owner);
      container_ol.appendChild(new_li);
    })
    }
  } catch (error) {
    return;
  }
  return;
}

//Refresh the entire display of the dates 
async function refreshDisplayOfTheTimeTable(d){
	let monday_of_the_actual_week = getMondayOfTheWeek(d);

	let month_of_monday = monday_of_the_actual_week.getMonth() + 1;
	let date_of_the_monday = monday_of_the_actual_week.getDate();

	if (month_of_monday <=9){
		month_of_monday = "0"+month_of_monday;
	}
	let message = "Semaine du " + date_of_the_monday + "/" + month_of_monday; 
	document.getElementById("datechanger").textContent = message;
	await initializeDaysOnTimeTable(monday_of_the_actual_week);
}
//Clear the table on a new week
function clearTable(){
  document.querySelectorAll('.session-list').forEach(element => {
    element.replaceChildren();
  });
}
//The global initializer
export async function initializePlanning(){
  document.getElementById('app').toggleAttribute('hidden');
  clearTable();
  await refreshDisplayOfTheTimeTable(ACTUAL_DISPLAY_DATE);	
};

//Buttons to switch week
export async function addOneWeek(){
	ACTUAL_DISPLAY_DATE.setDate(ACTUAL_DISPLAY_DATE.getDate() + 7);
  clearTable();
  await refreshDisplayOfTheTimeTable(ACTUAL_DISPLAY_DATE);
}
export async function minusOneWeek(){
	ACTUAL_DISPLAY_DATE.setDate(ACTUAL_DISPLAY_DATE.getDate() - 7);
  clearTable();
  await refreshDisplayOfTheTimeTable(ACTUAL_DISPLAY_DATE);
}
