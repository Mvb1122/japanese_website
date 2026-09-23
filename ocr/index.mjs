import { OCR } from "./ocr.mjs";
import { getSave, resetSave } from "./save_management.mjs";

console.log(OCR);
// After load, hide cover. 
document.getElementById('cover').style.display = 'none';

async function Test() {
    console.log("Starting test...")
    const output = await OCR('./test.png');
    console.log("Finished test: " + output);
}

document.getElementById('testButton').addEventListener('click', Test);

function firstTimeStartup() {
    // Make basic data.
    const save = getSave();
    console.log(save);
}

document.getElementById("start").addEventListener("click", firstTimeStartup);