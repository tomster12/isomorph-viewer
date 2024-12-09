const MESSAGE_VIEW = document.getElementById("message-view");
const ISOMORPH_VIEW = document.getElementById("isomorph-view");

let messageInstances = [];
let isomorphsInstances = {};
let selectedIsomorph = null;

for (let i = 0; i < EYE_MESSAGES.length; i++) {
    let messageInstance = {};
    messageInstance.letters = [];
    messageInstance.index = i;

    messageInstance.element = document.createElement("div");
    messageInstance.element.classList.add("message");

    for (let j = 0; j < EYE_MESSAGES[i].length; j++) {
        let letter = document.createElement("div");
        letter.textContent = EYE_MESSAGES[i][j].toString();
        messageInstance.element.appendChild(letter);
        messageInstance.letters.push(letter);
    }

    MESSAGE_VIEW.appendChild(messageInstance.element);
    messageInstances.push(messageInstance);
}

function setIsomorphLetters(index, start, length, toggle, pattern = "") {
    for (let i = 0; i < length; i++) {
        if (!toggle) {
            messageInstances[index].letters[start + i].className = "";
            continue;
        }

        let letter = pattern[i] == "." ? "blank" : pattern[i];
        messageInstances[index].letters[start + i].className = "letter-" + letter;
    }
}

function selectIsomorph(key) {
    if (selectedIsomorph != null) {
        selectedIsomorph.element.classList.remove("selected");
        const isomorphData = ISOMORPH_DATA[selectedIsomorph.key];
        const length = selectedIsomorph.key.length;

        for (let i = 0; i < isomorphData.length; i++) {
            setIsomorphLetters(isomorphData[i][0], isomorphData[i][1], length, false);
        }
    }

    selectedIsomorph = isomorphsInstances[key];

    if (selectedIsomorph != null) {
        selectedIsomorph.element.classList.add("selected");
        const isomorphData = ISOMORPH_DATA[selectedIsomorph.key];
        const length = selectedIsomorph.key.length;

        for (let i = 0; i < isomorphData.length; i++) {
            setIsomorphLetters(isomorphData[i][0], isomorphData[i][1], length, true, key);
        }
    }
}

for (const key in ISOMORPH_DATA) {
    const isomorphData = ISOMORPH_DATA[key];
    let isomorphInstance = {};
    isomorphInstance.key = key;

    isomorphInstance.element = document.createElement("div");
    isomorphInstance.element.classList.add("isomorph");

    let patternElement = document.createElement("div");
    patternElement.classList.add("pattern");
    patternElement.textContent = key;
    isomorphInstance.element.appendChild(patternElement);

    let labelElement = document.createElement("div");
    labelElement.classList.add("label");
    labelElement.textContent = "x" + isomorphData.length.toString();
    isomorphInstance.element.appendChild(labelElement);

    isomorphInstance.element.onclick = () => selectIsomorph(key);

    ISOMORPH_VIEW.appendChild(isomorphInstance.element);
    isomorphsInstances[key] = isomorphInstance;
}
