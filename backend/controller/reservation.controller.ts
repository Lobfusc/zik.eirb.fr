import { isLogged, isMember, isAdmin, isMemberOrAdmin, currentLogin } from '../auth/auth.service.ts'
import { createReservation } from '../db/database.ts'
import sanitizeHtml from 'sanitize-html';


function castToTsRange(date, start_res_hour, start_res_min, end_res_hour, end_res_min) {
    //The thing is that the modal hour selection on the front end uses multiple functions.
    //PostGreSQL can use a TSRnge which is better. We need to cast it.
    const start_time = `${date} ${start_res_hour.toString().padStart(2, "0")}:${start_res_min.toString().padStart(2, "0")}:00`;
    const end_time = `${date} ${end_res_hour.toString().padStart(2, "0")}:${end_res_min.toString().padStart(2, "0")}:00`;
    return { start: start_time, end: end_time };
}

function testsBeforeSQL(request, admin) {
    //Is the user connected and member
    if (!isLogged(request)) {
        return { accepted: false, msg: "Erreur : vous n'êtes pas connecté" }
    } else {
        if (!isMemberOrAdmin(request)) {
            return { accepted: false, msg: "Erreur : vous n'avez pas les droits pour cette réservation" }
        }
    }
    //Verify if the admin is an admin for the admin resa
    if (!isAdmin(request) && admin == true) {
        return { accepted: false, msg: "Erreur : vous n'avez pas les droits pour cette réservation" }
    }

    return { accepted: true, msg: "No error" }
}

function verifyDateHours(request) {


    //Verify the date
    const [year, month, day] = request.body.date.split('-').map((s) => Number(sanitizeHtml(s)));
    const input_date = new Date(year, month - 1, day); //months go from 0 to 11 
    const actual_year = new Date().getFullYear()
    const actual_date = new Date();

    //Cannot reserve the sunday
    if (input_date.getDay() === 0){
        return { accepted: false, msg: "Erreur : réservation impossible le dimanche, vérifiez les horaires" }
    }

    //Verify integers
    if (! (Number.isInteger(request.body.start_res_hour) && Number.isInteger(request.body.start_res_min) && Number.isInteger(request.body.end_res_hour) && Number.isInteger(request.body.end_res_min) )){
        return { accepted: false, msg: "Erreur : réservation invalide" }
    }

    //Every morning it's like 7:30 to ...    
    if (request.body.start_res_hour < 7 && request.body.start_res_min < 30) {
        return { accepted: false, msg: "Erreur : réservation invalide, vérifiez l'horaire de début" }
    }

    //if it's saturday
    if (input_date.getDay() == 6){
        //max is 19:30
        if (request.body.end_res_hour > 19 && request.body.end_res_min > 30) {
            return { accepted: false, msg: "Erreur : réservation invalide, vérifiez l'horaire de fin" }
        }
    }else{
        //max is 22:30
        if (request.body.end_res_hour > 22 && request.body.end_res_min > 30) {
            return { accepted: false, msg: "Erreur : réservation invalide, vérifiez l'horaire de fin" }
        }
    }

 

    //Verify if the end res hour is after the start res hour, and if not the min 
    if ((request.body.end_res_min) % 15 != 0 || (request.body.start_res_min) % 15 != 0 || request.body.start_res_hour > request.body.end_res_hour || (request.body.start_res_hour == request.body.end_res_hour && request.body.start_res_min >= request.body.end_res_min)) {
        return { accepted: false, msg: "Erreur : réservation invalide, vérifiez les horaires" }
    }
    

    //If this is a passed date
    input_date.setHours(request.body.start_res_hour, request.body.start_res_min, 0, 0); //UTC JS no need to convert


    //If it's not an admin reservation, max 3h
    if (!request.body.admin){
        let start_minutes = request.body.start_res_hour * 60 + request.body.start_res_min
        let end_minutes = request.body.end_res_hour * 60 + request.body.end_res_min
        if (end_minutes - start_minutes > 180){
            return { accepted: false, msg: "Erreur : réservation trop longue" }
        }
    }

    //verify if it's the actual year and valid day. Verify if the start is before now
    if (!(parseInt(year) === parseInt(actual_year) && parseInt(input_date.getFullYear()) === parseInt(year) && parseInt(input_date.getMonth()) === parseInt(month - 1) && parseInt(input_date.getDate()) === parseInt(day) && actual_date <= input_date)) {
        return { accepted: false, msg: "Erreur : réservation invalide, vérifiez la date" }
    }
    return { accepted: true, msg: "No error" }
}

function verifyMaxLength(request) {
    if (request.body.name.length > 40) {
        return { accepted: false, msg: "Erreur : nom de réservation trop long" }
    }

    return { accepted: true, msg: "No error" }
}

function verifyEmpty(request) {
    if (request.body.name === "" || request.body.data === "" || request.body.start_res_hour === "" || request.body.start_res_min === "" || request.body.end_res_hour === "" || request.body.end_res_min === "") {
        return { accepted: false, msg: "Erreur : réservation invalide, données manquantes" }
    }
    return { accepted: true, msg: "No error" }
}

export async function reserve_slot(request) {
    try {
        let is_admin_res = false;
        let rsp;
        //If the frontend tries to pass another thing
        if (request.body.admin != true && request.body.admin != false) {
            is_admin_res = false;
        } else {
            //If it's true or false, then you can add it
            is_admin_res = request.body.admin;
        }

        //Verify if not empty
        rsp = verifyEmpty(request);
        if (rsp.accepted == false) { return rsp }

        rsp = verifyMaxLength(request);
        if (rsp.accepted == false) { return rsp }

        //Verify if the hours and date are valid
        rsp = verifyDateHours(request);
        if (rsp.accepted == false) { return rsp }

        const cast_to_range = castToTsRange(sanitizeHtml(request.body.date), sanitizeHtml(request.body.start_res_hour), sanitizeHtml(request.body.start_res_min), sanitizeHtml(request.body.end_res_hour), sanitizeHtml(request.body.end_res_min));
        var sanitize_req = {
            login: currentLogin(request),
            name: sanitizeHtml(request.body.name),
            start_time: cast_to_range.start,
            end_time: cast_to_range.end,
            admin: is_admin_res,
        }
        //Tests permissions ...
        rsp = testsBeforeSQL(request, sanitize_req.admin);
        if (rsp.accepted == false) { return rsp }

        //We do the SQL request
        rsp = await createReservation(sanitize_req);
        return rsp;
    } catch (error) {
        return { accepted: false, msg: "Erreur : veuillez essayer de vous reconnecter" }
    }
}
