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