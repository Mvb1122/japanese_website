export class SaveData {
    /**
     * @type {Sample[]}
     */
    samples = [];
    name = ""

    save = () => {
        localStorage.setItem(saveKey, JSON.stringify(this));
    }

    loadFromObj = (object) => {
        Object.keys(object).map(key => {
            this[key] = object[key];
        })
        return this;
    }

    addSample = (sample) => {
        this.samples.push(sample)
        this.save();
    }

    hasSampleFor = (symbol) => {
        return this.samples.findIndex(v => v.word == symbol) != -1;
    }
}

class Sample {
    sentence = ""
    word = ""

    /**
     * Cooresponds to key in images db.
     */
    image = ""
    bounds = ""

    save = () => {
        getSave().addSample(this);
    }
}

const saveKey = "save";
const imagesDbKey = "images";

/**
 * @returns {SaveData}
 */
export function resetSave() {
    localStorage.clear();
    const save = new SaveData();
    save.save();
    return save;
}

/**
 * @returns {SaveData}
 */
export function getSave() {
    if (localStorage.getItem(saveKey) != null)
        return new SaveData().loadFromObj(JSON.parse(localStorage.getItem(saveKey))) 
    else return resetSave();
}

export function hasSave() {
    return localStorage.getItem(saveKey) != null && getSave() != new SaveData();
}

/**
 * Ensures that image is saved and adds sample to getSave() result.
 * @param {string} sentence 
 * @param {string} word 
 * @param {File} imageBlob 
 * @param {import("./tesseract_resp").BoundingBox} bounds 
 */
export function addSample(sentence, word, imageBlob, bounds) {
    const sample = new Sample();
    sample.bounds = bounds;
    sample.image = imageBlob.name;
    sample.sentence = sentence; 
    sample.word = word;

    if (!hasImage(imageBlob)) addImage(imageBlob);

    return sample; 
}

/**
 * @returns {Object} Names of images mapped to 
 */
function getImagesDb() {
    if (localStorage.getItem(imagesDbKey) == null) localStorage.setItem(imagesDbKey, "{}");
    return JSON.parse(localStorage.getItem(imagesDbKey));
}

/**
 * @param {File} imageBlob 
 */
function hasImage(imageBlob) {
    return Object.keys(getImagesDb())
        .find(v => v == imageBlob.name) != -1;
}

/**
 * @param {File} imageBlob 
 */
function addImage(imageBlob) {
    const images = getImagesDb();
    images[imageBlob.name] = URL.createObjectURL(imageBlob);
    localStorage.setItem(imagesDbKey, JSON.stringify(images))
}