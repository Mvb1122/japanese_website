import { OCR } from "./ocr.mjs";
import { getSave, hasSave } from "./save_management.mjs";

const containers = {
    cover: {
        id: "cover"
    },
    startup: {
        id: "startup"
    },
    name: {
        id: "nameContainer"
    },
    home: {
        id: "homescreen",
        onLoad: () => {
            setupHomescreen();
        }
    },
    scan: {
        id: "scanScreen"
    }
}

function showOnly(container) {
    Object.keys(containers).forEach(key => {
        document.getElementById(containers[key].id).hidden = true;
    })
    document.getElementById(container.id).hidden = false;
    if ('onLoad' in container) container.onLoad();
}

// After load, hide cover. 
document.getElementById('cover').style.display = 'none';

async function Test() {
    console.log("Starting test...")
    const output = await OCR('./test.png');
    console.log("Finished test: " + output);
}

document.getElementById('testButton').addEventListener('click', Test);

function firstTimeStartup() {
    showOnly(containers.name);
    
    document.getElementById("nameSubmitButton").addEventListener('click', () => {
        // Make basic data + show name input screen, then save.
        const save = getSave();
        const text = document.getElementById("nameInput").value;
        save.name = text;
        save.save();

        // Go to home screen.
        showOnly(containers.home);
    })
}

document.getElementById("start").addEventListener("click", firstTimeStartup);

function setupHomescreen() {
    // prefix:
    let prefix = "";
    const hours = new Date().getHours();
    if (hours < 6) prefix = "こんばんは。あるいは、こんにちは、"
    if (hours < 16) prefix = "こんにちは、"
    else prefix = "こんばんは、"

    document.getElementById("greeting").innerText = prefix + getSave().name + "さん！"

    let requestMessage = "";
    if (getSave().samples.length > 1) requestMessage = "Shall we take your first scan?";
    else requestMessage = "Welcome back. Let's get to scanning!!!"
    document.getElementById("scanMessage").innerText = requestMessage;

    /**
     * @type {HTMLInputElement}
     */
    const filesEl = document.getElementById("environment");
    document.getElementById("environment").addEventListener('change', async _ => {
        showOnly(containers.scan)
        const files = filesEl.files;

        for (let i = 0; i < files.length; i++) {
            const image = files.item(i);
            document.getElementById("scanTitle").innerText = image.name;
            document.getElementById("scanImage").src = URL.createObjectURL(image);
            document.getElementById("scanText").innerText = "";
        
            // OCR it. 
            const output = await OCR(image, (chunk) => {
                document.getElementById("scanText").innerText += chunk;
            });

            console.log(output);
        }
        showOnly(containers.home)
    })
}

// On boot, if we have save then go to home screen... otherwise, go to startup...
if (hasSave()) {
    showOnly(containers.home)
} else {
    showOnly(containers.startup);
}