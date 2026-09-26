//BACKEND CONFIG
const backend_reserve_a_date = "/api/reservation";

//CONFIG
const default_hour = 7;
const default_minutes = 30;
const default_min_interval_for_res = 15;

const start_hour = 7;
const start_minutes = 30

const end_hour_week = 22;
const end_minutes_week = 30;

const end_hour_sat = 19;
const end_minutes_sat = 30;


const interval_btw_min = 15;

//GLOBALS
let hour;
let minutes;
let start_res_hour = null;
let start_res_min = null;

let which_hour_picker;

let end_res_hour = null;
let end_res_min = null;

let date_reservation = null;



//Open Reservation Form
export function toogleVisResForm() {
    const date = new Date();
    let day = date.getDate();
    let month_plus_one = date.getMonth() + 1;


    if (document.getElementById('modalOverlay').getAttribute('hidden') !== null) {
        document.getElementById("resDate").textContent = "Réserver le zik !";
        //Put the Actual date for the resa
        const year = date.getFullYear();
        const month_pad = String(date.getMonth() + 1).padStart(2, '0')
        const day_pad = String(date.getDate()).padStart(2, '0');
        document.getElementById("dateReservation").value = `${year}-${month_pad}-${day_pad}`;
    }
    document.getElementById('modalOverlay').toggleAttribute('hidden');

    //Prevent mobile bugs when scrolling with a modal opened
    if (document.body.style.position == "") {
        document.body.style.position = 'fixed';
    } else {
        document.body.style.position = '';
    }
}

//To expand if you want to create a personnal opening bubble
function errorMessage(msg) {
    alert(msg)
}

export function reserveADate() {

    let res_name = document.getElementById("reservationName").value;
    let is_admin = document.getElementById("adminRes").checked;
    let date_reservation = document.getElementById("dateReservation").value;

    var request = {
        name: res_name,
        date: date_reservation,
        start_res_hour: start_res_hour,
        start_res_min: start_res_min,
        end_res_hour: end_res_hour,
        end_res_min: end_res_min,
        admin: is_admin,
    }
    //First Verification on the front end if not empty 
    if (start_res_hour == null || start_res_min == null || end_res_hour == null || end_res_min == null || res_name == "" || date_reservation == "") {
        errorMessage("Erreur : veuillez remplir tous les champs");
        return false; //For not reloading the page if alerts
    } else {
        //Fetch the values of the form
        try {
            fetch(backend_reserve_a_date, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(request)
            }).then(response => {
                return response.json()
            }).then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    errorMessage(data.message);
                }
            })

        } catch (error) {
        }

    }
}

// -- HOUR PICKERS -- \\
//Reservation Form :

//Open hour Picker, start if this is the start Picker, end, if this is the end picker
//We use the same code for both
export function openHourPicker(status) {

    if (isSunday()){
            errorMessage("Erreur : vous ne pouvez pas réserver un dimanche")
    }else{    

        //Get an error Message if end hour before start 
        if (status === "end" && (start_res_hour == null || start_res_min == null)) {
            errorMessage("Erreur : veuillez choisir une heure de début avant de choisir une heure de fin");
        } else {
            document.getElementById('HourPicker').toggleAttribute('hidden');
            hour = default_hour;
            minutes = default_minutes;

            display_minutes();
            display_hour();
            //Start hour Picker
            if (status === "start") {
                document.getElementById('titleHourPicker').textContent = "Heure de début";
                which_hour_picker = "start"; //Global variable

                //Reinitialize the end picker to prevent bugs of hours
                document.getElementById("endHourPicker").classList.remove('text-left');
                document.getElementById("endHourPicker").classList.add('text-right');
                document.getElementById("endHourPicker").textContent = "⏱";

            }
            //End hour Picker
            if (status === "end") {
                document.getElementById('titleHourPicker').textContent = "Heure de fin";
                which_hour_picker = "end";
                if (start_res_hour !== null && start_res_min !== null) {
                    //initialize to the start hour + default interval 
                    hour = start_res_hour;
                    minutes = start_res_min;
                }
            }
            display_hour();
            display_minutes();

        }
    }
}

//Toogle visibility for close and open buttons
export function toggleVisHourPicker() {
    document.getElementById('HourPicker').toggleAttribute('hidden');
}


//Refresh the display of hours
function display_hour() {
    //To normalize typing with 2 numbers
    if (hour < 10) {
        document.getElementById('hour').textContent = '0' + hour;

    } else {
        document.getElementById('hour').textContent = hour;

    }
}

//Refresh the display of minutes
function display_minutes() {
    if (minutes == 0) {
        document.getElementById('minutes').textContent = '0' + minutes;

    } else {
        document.getElementById('minutes').textContent = minutes;

    }
}

//Functions for refresh the display of the initial reservation form
function refresh_start_label() {
    //Change the display to see on the left
    document.getElementById("startHourPicker").classList.remove('text-right');
    document.getElementById("startHourPicker").classList.add('text-left');

    //Display X:00
    if (start_res_min < 10) {
        document.getElementById("startHourPicker").textContent = start_res_hour + ":0" + start_res_min;
    } else {
        document.getElementById("startHourPicker").textContent = start_res_hour + ":" + start_res_min;
    }

}

function refresh_end_label() {
    //Change the display to see on the left
    document.getElementById("endHourPicker").classList.remove('text-right');
    document.getElementById("endHourPicker").classList.add('text-left');

    //Display X:00
    if (end_res_min < 10) {
        document.getElementById("endHourPicker").textContent = end_res_hour + ":0" + end_res_min;
    } else {
        document.getElementById("endHourPicker").textContent = end_res_hour + ":" + end_res_min;
    }

}

function isSunday(){
    let date_reservation = document.getElementById("dateReservation").value;
    let DATE_RES = new Date(date_reservation)

    return DATE_RES.getDay() == 0
}

//Get the day of the current reservation
function getMinMaxDate(){
    let date_reservation = document.getElementById("dateReservation").value;
    let DATE_RES = new Date(date_reservation)

    //The user date must be between min date and max date 
    let MIN_DATE = new Date(date_reservation)
    MIN_DATE.setHours(start_hour, start_minutes, 0,0);

    let MAX_DATE = new Date(date_reservation)
    
    //The saturday case
    if (DATE_RES.getDay() == 6){
        MAX_DATE.setHours(end_hour_sat, end_minutes_sat, 0, 0);
    }else{
        MAX_DATE.setHours(end_hour_week, end_minutes_week, 0, 0);
    }
    return [MIN_DATE, MAX_DATE] 
}

//add 1 Hour
export function addHour() {
    let [MIN_DATE, MAX_DATE] = getMinMaxDate();
    
    let date_reservation = document.getElementById("dateReservation").value;
    let current = new Date(date_reservation)
    current.setHours(hour+1, minutes, 0, 0)

    if (MIN_DATE <= current && current <= MAX_DATE){
        hour+=1
    }  
    display_hour();
    display_minutes();
}

//add interval_btw_minutes Minute(s)
export function addMinutes() {
    let day = getMinMaxDate()

    //Penser au bug si c'est en dessous de start res hour +15 % 60
    let [MIN_DATE, MAX_DATE] = getMinMaxDate();
    
    let date_reservation = document.getElementById("dateReservation").value;
    let current = new Date(date_reservation)
    if (minutes != 45){
        current.setHours(hour, minutes+15, 0, 0)
    }else{
        current.setHours(hour+1, 0, 0, 0)
    }
    
    if (MIN_DATE <= current && current <= MAX_DATE){
        if (minutes == 45){
            minutes = 0
            hour+=1
        }else{
            minutes += 15
        }
    }  
    display_hour();
    display_minutes();

}

//minusHour
export function minHour() {
    let [MIN_DATE, MAX_DATE] = getMinMaxDate();
    
    let date_reservation = document.getElementById("dateReservation").value;
    let current = new Date(date_reservation)
    current.setHours(hour-1, minutes, 0, 0)

    if (MIN_DATE <= current && current <= MAX_DATE){
        hour-=1
    }  
    display_hour();
    display_minutes();
}

//minusMinutes
export function minMinutes() {
    let day = getMinMaxDate()

    //Penser au bug si c'est en dessous de start res hour +15 % 60
    let [MIN_DATE, MAX_DATE] = getMinMaxDate();
    
    let date_reservation = document.getElementById("dateReservation").value;
    let current = new Date(date_reservation)
    if (minutes != 0){
        current.setHours(hour, minutes-15, 0, 0)
    }else{
        current.setHours(hour-1, 45, 0, 0)
    }
    
    if (MIN_DATE <= current && current <= MAX_DATE){
        if (minutes == 0){
            minutes = 45
            hour-=1
        }else{
            minutes -= 15
        }
    }  
    display_hour();
    display_minutes();

}


//validation of Hour Reservation Modal
export function validateHourPicker() {
    if (which_hour_picker === "start") {
        start_res_hour = hour;
        start_res_min = minutes;
        refresh_start_label();
    }
    if (which_hour_picker === "end") {
        end_res_hour = hour;
        end_res_min = minutes;
        refresh_end_label();
    }
    toggleVisHourPicker();
}
