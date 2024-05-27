const express = require("express");
const app = express();
//enable CORS 
var cors = require('cors');

app.use(cors({ origin: true, credentials: true }));

app.get("/", (req, res) => {
    res.send("Hello World from express?!");
});

app.get("/timeline", (req, res) => {
    const TIME_SLOT_SIZE_MINUTES = 5;
    const AMOUNT_WARNING = 8;
    const AMOUNT_CRITICAL = 10;
    const COLOR_OK = '#0ce504';
    const COLOR_WARN = '#e59604';
    const COLOR_CRIT = '#B33';

    const timeSlots = [];
    const currentTime = new Date();
    const minutes = currentTime.getMinutes();
    currentTime.setMinutes(minutes - (minutes % TIME_SLOT_SIZE_MINUTES));
    for (var i = -5; i < 15; i++) {
        // Generate time slots every TIME_SLOT_SIZE_MINUTES minutes
        timeSlots.push({ time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        currentTime.setMinutes(currentTime.getMinutes() + TIME_SLOT_SIZE_MINUTES);
    }

    const heights = timeSlots.map((timeSlot, index) => parseInt(Math.random() * 15));



    res.send(timeSlots.map((timeSlot, index) => ({
        time: timeSlot.time,
        height: heights[index],
        color: heights[index] > AMOUNT_CRITICAL ? COLOR_CRIT : (heights[index] > AMOUNT_WARNING ? COLOR_WARN : COLOR_OK),
        border: index == 5 ? '#000' : '#FFF',
        width: index == 5 ? 4 : 0,
    })));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
