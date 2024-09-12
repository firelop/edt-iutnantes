<script>
    import {onMount} from "svelte";
    import Calendar from '@event-calendar/core';
    import TimeGrid from '@event-calendar/time-grid';
    import { parseICAL } from "./parse-ical.js";

    let plugins = [TimeGrid];
    let weekView = true;


    async function getEvents() {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = 'https://edt.univ-nantes.fr/iut_nantes/g3146.ics';
        const response = await fetch(proxyUrl + targetUrl);
        const icsTimetable = await response.text();

        let events = await parseICAL(icsTimetable);
        console.log(icsTimetable);


        options.events = events;
        console.log(options);
        return events;
    }

    let events_promise = getEvents()


    function handleViewButtonClick() {
        weekView = !weekView;

        options.customButtons.dayView.active = !weekView;
        options.customButtons.weekView.active = weekView;
        options.view = weekView ? "timeGridWeek" : "timeGridDay";

        console.log("Hey oh");
    }

    let options = {
        view: weekView ? "timeGridWeek" : "timeGridDay",
        allDaySlot: false,
        hiddenDays: [0, 6],
        nowIndicator: true,
        slotEventOverlap: false,
        customButtons: {
            dayView: {
                text: "jour",
                click: handleViewButtonClick,
                active: !weekView
            },
            weekView: {
                text: "semaine",
                click: handleViewButtonClick,
                active: weekView
            }
        },
        slotMinTime: "8:00:00",
        slotMaxTime: "20:00:00",
        headerToolbar: {start: "weekView,dayView", center: "title", end: "prev,today,next"},
        events: [],
    };
</script>

<main>
    {#await events_promise}
        <p>Fetching timetable</p>
    {:then _}
        <Calendar {plugins} {options} />
    {/await}
</main>