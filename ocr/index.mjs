import { OCR } from "./ocr.mjs";
import { addSample, getSave, hasSave } from "./save_management.mjs";

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
            setScanRejectButtonVisibility(false)
            document.getElementById("scanTitle").innerText = image.name;
            const imageURL = URL.createObjectURL(image);
            document.getElementById("scanImage").src = imageURL;
            document.getElementById("scanText").innerText = "";
        
            // OCR it. 
            const output = await OCR(image, (status) => {
                document.getElementById("scanText").innerText = status;
            });

            // Filter out low confidence
            for (const block of output.data.blocks)
                if (block.confidence <= 0.7)
                    output.data.blocks.splice(output.data.blocks.indexOf(block), 1)

            // Display recognized text, then wait for confirmation.
            if (output.data.blocks.length > 0) {
                document.getElementById("scanText").innerText = output.data.blocks.reduce((whole, part) => whole += part.text, "");
                document.getElementById("temporarySamples").innerHTML = "";
                let preppedSamples = [];
                for (const block of output.data.blocks)
                    for (const paragraph of block.paragraphs)
                        for (const line of paragraph.lines)
                            for (const words of line.words) {
                                // Kanji images parsed by word.
                                for (const symbol of words.symbols)
                                    if (!getSave().hasSampleFor(symbol.text)) {
                                        const sample = addSample(line.text, symbol.text, image, symbol.bbox);
                                        preppedSamples.push(sample);

                                        // Show image clip.
                                        const tempImage = document.createElement('img');
                                        tempImage.src = imageURL;
                                        const bounds = symbol.bbox;
                                        tempImage.style.objectViewBox = `xywh(${bounds.x0}px ${bounds.y0}px ${bounds.x1 - bounds.x0}px ${bounds.y1 - bounds.y0}px)`;
                                        tempImage.setAttribute("word", symbol.text)
                                        
                                        document.getElementById("temporarySamples").appendChild(tempImage);
                                    }
                            }

                setScanRejectButtonVisibility(true);
                await new Promise(res => {

                    // accept or reject logic here.
                    document.getElementById("acceptScanButton").onclick = () => {
                        // Accept means save all.
                        preppedSamples.forEach(v => v.save());
                        res();
                    }

                    document.getElementById("rejectScanButton").onclick = () => {
                        // Do nothing and move on.
                        res();
                    }
                });
                setScanRejectButtonVisibility(false);
            } else {
                // If no pictures, reject!
                document.getElementById("scanText").innerText = "No text recognized! Auto-rejecting after 5 seconds."
                await new Promise(res => {
                    setTimeout(() => {
                        res();
                    }, 5000);
                });

                // Do nothing to reject.
            }
        }
        showOnly(containers.home)
    })
}

function setScanRejectButtonVisibility(visible) {
    document.getElementById("acceptScanButton").hidden = !visible;
    document.getElementById("rejectScanButton").hidden = !visible;
}

// On boot, if we have save then go to home screen... otherwise, go to startup...
if (hasSave()) {
    showOnly(containers.home)
} else {
    showOnly(containers.startup);
}