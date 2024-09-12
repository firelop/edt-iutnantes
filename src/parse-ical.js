const THEME = {"Cours": "#3772FF", "TD": "#FDCA40", "TP": "#6BF178", "other": "#C28CAE"};

function ICALDatetimeToJSDate(ICALDatetime) {
    /**
     * Instantiate a new Date corresponding to ICALDatetime
     *
     * @param {string} icsContent - An ICAL Datetime (YYYYMMDDTHHMMSS's format)
     * @returns {Date}
     */

    return new Date(
        ICALDatetime.slice(0,4),
        ICALDatetime.slice(4,6) - 1,
        ICALDatetime.slice(6,8),
        ICALDatetime.slice(9,11),
        ICALDatetime.slice(11,13) // Ignore seconds
    )
}

function formatTitle(rawSummary, location) {
    let [courseTitle, teacher] = rawSummary.split("\\,");

    const title = `<span class="room">${location}</span><h4>${courseTitle}</h4>` + (teacher ? `<p>${teacher}</p>` : ''); // TODO: Change the bad HTML semantic for the room badge and test a possible XSS vulnerability
    const course_type = courseTitle.split(" - ")[0];
    const color = course_type in THEME ? THEME[course_type] : THEME["other"];

    return [title, color];
}

export async function parseICAL(icsContent) {
    /**
     * Transform a .ics file into an array of calendar's Event object
     * This function should be used for "Nantes IUT" timetables only, it doesn't implement the whole ICAL specifications
     * Headers are skipped.
     *
     * @param {string} icsContent - The raw text content of the .ics file
     * @throws {Error} - Can throw errors when icsContent is malformed
     * @returns {Array}
     */

    let index = 0;
    const events = []; // Event object are defined as : https://github.com/vkurko/calendar?tab=readme-ov-file#event-object

    index = icsContent.indexOf("BEGIN:VEVENT", index) + 13;

    while(index > 12) {
        const DTSTART_INDEX = icsContent.indexOf("DTSTART", index) + 8;
        const DTEND_INDEX = icsContent.indexOf("DTEND", index) + 6;
        const SUMMARY_INDEX =  icsContent.indexOf("SUMMARY", index) + 8;
        const LOCATION_INDEX = icsContent.indexOf("LOCATION", index) + 9;

        const location = icsContent.substring(LOCATION_INDEX, icsContent.indexOf('\n', LOCATION_INDEX));

        let [_title, color] = formatTitle(icsContent.slice(SUMMARY_INDEX, icsContent.indexOf('\n', SUMMARY_INDEX)), location);


        let event = {
            id: events.length,
            allDay: false,
            start: ICALDatetimeToJSDate(icsContent.slice(DTSTART_INDEX, DTSTART_INDEX + 15)), // ICAL Datetime are 15 chars long
            end: ICALDatetimeToJSDate(icsContent.slice(DTEND_INDEX, DTEND_INDEX + 15)),
            title: {html: _title },
            backgroundColor: color,
            textColor: "black",
            extendedProps: {
                room: location
            }
        }
        events.push(event);
        console.log(event);

        index = icsContent.indexOf("BEGIN:VEVENT", index) + 13 // Goto next event or set index to 12 if there is no following event
    }

    return events;
}