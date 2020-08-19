const CORS = 'https://cors-anywhere.herokuapp.com/';
const quote = undefined;
const slider = document.getElementById('slider');
const timerDuration = document.getElementById('timerDuration');
const settingsTab = document.getElementById('nav-settings-tab');
const redo = document.getElementById('redo');
const noti = document.getElementById('noti');
const canvas = document.getElementById("timer");
const ctx = canvas.getContext('2d');
ctx.lineWidth = 28;
ctx.lineCap = 'round';
ctx.font = "80px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
const arc = 2 * Math.PI;
let timer = undefined;
let state = 1;
let elapsed = 0;
let duration = 0;

const getQuote = async () => {
    if (!quote) {
        const endpoint = `${CORS}https://quotes.rest/qod?language=en&category=inspire`;
        try {
            const response = await fetch(endpoint, {
                headers: {
                    "Content-type": "application/json"
                }
            });
            if (response.ok) {
                const json = await response.json();
                const quoteElement = document.getElementById('quote');
                quoteElement.innerText = json.contents.quotes[0].quote;
                quoteElement.cite = json.contents.quotes[0].author;
                quoteElement.style.display = "block";
                quote = json.contents.quotes[0].quote;
            }
        } catch (error) {
            return "Server Error!";
        }
    }
}

const toString = (time) => {
    let measuredTime = new Date(null);
    measuredTime.setSeconds(time); // specify value of SECONDS
    return measuredTime.toISOString().substr(11, 8);
}

const reset = () => {
    getQuote();
    chrome.storage.sync.get(['duration'], (value) => {
        timerDuration.innerHTML = `Timer duration: ${value.duration} minute(s)`;
        slider.value = value.duration;
        ctx.fillText(toString(value.duration * 60), canvas.width / 2, canvas.height / 2);
        duration = value.duration * 60;
    });
    chrome.storage.sync.get(['notiEnabled'], (value) => {
        noti.checked = value.notiEnabled;
    })
    ctx.strokeStyle = '#AAAFB4';
    ctx.clearRect(0, 0, 600, 600);
    ctx.beginPath();
    ctx.arc(300, 300, 230, 0, 2 * Math.PI);
    ctx.stroke();

}

reset();

const runTimer = () => {
    state = 0;
    settingsTab.className += " disabled";
    timer = setInterval(() => {
        ctx.clearRect(0, 0, 600, 600);
        ctx.strokeStyle = '#AAAFB4';
        ctx.beginPath();
        ctx.arc(300, 300, 230, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = '#007bff';
        ctx.beginPath();
        ctx.arc(300, 300, 230, -Math.PI / 2, -Math.PI / 2 + elapsed / duration * arc);
        ctx.stroke();
        ctx.fillText(toString(duration - elapsed), canvas.width / 2, canvas.height / 2);
        elapsed++;
        if (elapsed > duration) {
            state = 1;
            elapsed = 0;
            settingsTab.className = "nav-link";
            chrome.storage.sync.get(['notiEnabled'], (value) => {
                if (value.notiEnabled) {
                    chrome.notifications.create('reminder', {
                        type: 'basic',
                        iconUrl: 'images/noti.png',
                        title: 'Good work!',
                        message: 'Take a break?'
                    }, function (notificationId) { });
                }
            });
            clearInterval(timer);
        }
    }, 1000);

}

//State 0 = running, 1 = stop/paused
canvas.addEventListener("click", () => {
    if (state == 0) {
        state = 1;
        clearInterval(timer);
    } else {
        runTimer(elapsed, duration);
    }
})

slider.oninput = function () {
    chrome.storage.sync.set({ duration: this.value });
    timerDuration.innerHTML = `Timer duration: ${this.value} minute(s)`;
    duration = this.value * 60;
    reset();
}

redo.addEventListener("click", () => {
    settingsTab.className = "nav-link";
    elapsed = 0;
    clearInterval(timer);
    state = 1;
    reset();
})

noti.addEventListener("click", () => {
    chrome.storage.sync.get(['notiEnabled'], (value) => {
        chrome.storage.sync.set({ notiEnabled: !value.notiEnabled });
    })
})


