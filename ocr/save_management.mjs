export class SaveData {
    /**
     * @type {Sample[]}
     */
    samples = [];
    name = ""

    save = () => {
        localStorage.setItem(saveKey, this);
    }

    loadFromObj = (object) => {
        Object.keys(object).map(key => {
            this[key] = object[key];
        })
    }
}

class Sample {
    text = ""
    image = ""
}

const saveKey = "save";

/**
 * @returns {SaveData}
 */
export function resetSave() {
    localStorage.clear;
    localStorage.setItem(saveKey, JSON.stringify(new SaveData()));
    return getSave();
}

/**
 * @returns {SaveData}
 */
export function getSave() {
    if (localStorage.getItem(saveKey) != null)
        return new SaveData().loadFromObj(JSON.parse(localStorage.getItem(saveKey))) 
    else return resetSave();
}