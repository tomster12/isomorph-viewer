const MESSAGE_OUTER_CONTAINER_ELEMENT = document.getElementById("messages-outer-container");
const MESSAGE_CONTAINER_ELEMENT = document.getElementById("messages-container");
const MESSAGE_LETTER_INDICES_ELEMENT = document.getElementById("messages-letter-indices");
const MESSAGE_ROW_INDICES_ELEMENT = document.getElementById("messages-row-indices");
const ISOMORPH_CONTAINER_ELEMENT = document.getElementById("isomorph-container");
const TOGGLE_SHOW_NUMERIC_BUTTON_ELEMENT = document.getElementById("toggle-show-numeric-button");

let messageDisplays = [];
let isomorphDisplays = {};
let selectedPattern = null;
let maxLength = 0;
let showNumeric = false;

function updateIsomorphLabels() {
    for (const pattern in ISOMORPH_DATA) {
        let visibleInstances = 0;
        for (let instance of ISOMORPH_DATA[pattern].instances) {
            if (messageDisplays[instance[0]].visible) visibleInstances++;
        }

        isomorphDisplays[pattern].labelElement.textContent = "x" + visibleInstances.toString();
    }
}

function getColours(letter) {
    switch (letter) {
        case ".":
            return { bg: "#5f6a79", fg: "#3c3e3f" };

        case "A":
            return { bg: "#c7514b", fg: "#ffffff" };

        case "B":
            return { bg: "#5ab02c", fg: "#ffffff" };

        case "C":
            return { bg: "#cb9b00", fg: "#ffffff" };

        case "D":
            return { bg: "#e660c7", fg: "#ffffff" };

        case "E":
            return { bg: "#549c9f", fg: "#ffffff" };

        case "F":
            return { bg: "#4781ff", fg: "#ffffff" };
    }
}

function setIsomorphLetters(index, start, length, toggle, pattern = "") {
    for (let i = 0; i < length; i++) {
        if (!toggle) {
            messageDisplays[index].letters[start + i].className = "";
            messageDisplays[index].letters[start + i].style.backgroundColor = "";
            messageDisplays[index].letters[start + i].style.color = "";
            continue;
        }

        let colours = getColours(pattern[i]);
        messageDisplays[index].letters[start + i].className = "highlighted";
        messageDisplays[index].letters[start + i].style.backgroundColor = colours.bg;
        messageDisplays[index].letters[start + i].style.color = colours.fg;
    }
}

function selectIsomorph(pattern) {
    if (selectedPattern != null) {
        isomorphDisplays[selectedPattern].element.classList.remove("selected");
        for (let instance of ISOMORPH_DATA[selectedPattern].instances) {
            setIsomorphLetters(instance[0], instance[1], selectedPattern.length, false);
        }
    }

    if (selectedPattern == pattern) {
        selectedPattern = null;
        return;
    }

    selectedPattern = pattern;

    if (selectedPattern != null) {
        isomorphDisplays[selectedPattern].element.classList.add("selected");
        let leftmostIndex = Infinity;
        let leftmostIndexMessage = null;
        for (let instance of ISOMORPH_DATA[selectedPattern].instances) {
            setIsomorphLetters(instance[0], instance[1], selectedPattern.length, true, pattern);
            if (messageDisplays[instance[0]].visible && instance[1] < leftmostIndex) {
                leftmostIndex = instance[1];
                leftmostIndexMessage = instance[0];
            }
        }

        const letterElement = messageDisplays[leftmostIndexMessage].letters[leftmostIndex];
        MESSAGE_OUTER_CONTAINER_ELEMENT.scrollLeft = letterElement.offsetLeft - 100;
    }
}

function toggleShowNumeric() {
    showNumeric = !showNumeric;
    for (let i = 0; i < messageDisplays.length; i++) {
        for (let j = 0; j < messageDisplays[i].letters.length; j++) {
            let letter = messageDisplays[i].letters[j];
            letter.textContent = showNumeric ? EYE_MESSAGES[i][j].toString() : String.fromCharCode(EYE_MESSAGES[i][j] + 32);
        }
    }
    TOGGLE_SHOW_NUMERIC_BUTTON_ELEMENT.classList.toggle("toggled", showNumeric);
}

for (let i = 0; i < EYE_MESSAGES.length; i++) {
    let messageDisplay = {};
    messageDisplay.visible = true;
    messageDisplay.letters = [];
    messageDisplay.index = i;

    messageDisplay.element = document.createElement("div");
    messageDisplay.element.classList.add("message");

    maxLength = Math.max(maxLength, EYE_MESSAGES[i].length);
    for (let j = 0; j < EYE_MESSAGES[i].length; j++) {
        let letter = document.createElement("div");
        letter.textContent = showNumeric ? EYE_MESSAGES[i][j].toString() : String.fromCharCode(EYE_MESSAGES[i][j] + 32);
        messageDisplay.element.appendChild(letter);
        messageDisplay.letters.push(letter);
    }

    MESSAGE_CONTAINER_ELEMENT.appendChild(messageDisplay.element);
    messageDisplays.push(messageDisplay);

    let rowIndexElement = document.createElement("div");
    rowIndexElement.textContent = i.toString();
    MESSAGE_ROW_INDICES_ELEMENT.appendChild(rowIndexElement);
}

for (let i = 0; i < maxLength; i++) {
    let rowIndexElement = document.createElement("div");
    rowIndexElement.textContent = i.toString();
    if (i.toString().length > 2) rowIndexElement.style.fontSize = "0.8em";
    MESSAGE_LETTER_INDICES_ELEMENT.appendChild(rowIndexElement);
}

for (const pattern in ISOMORPH_DATA) {
    let isomorphDisplay = {};

    isomorphDisplay.element = document.createElement("div");
    isomorphDisplay.element.classList.add("isomorph");

    isomorphDisplay.patternElement = document.createElement("div");
    isomorphDisplay.patternElement.classList.add("pattern");
    isomorphDisplay.patternElement.textContent = pattern;

    isomorphDisplay.labelElement = document.createElement("div");
    isomorphDisplay.labelElement.classList.add("label");
    isomorphDisplay.labelElement.textContent = "x" + ISOMORPH_DATA[pattern].instances.length.toString();

    isomorphDisplay.scoreElement = document.createElement("div");
    isomorphDisplay.scoreElement.classList.add("score");
    isomorphDisplay.scoreElement.textContent = ISOMORPH_DATA[pattern].score.toFixed(2);

    isomorphDisplay.element.appendChild(isomorphDisplay.patternElement);
    isomorphDisplay.element.appendChild(isomorphDisplay.labelElement);
    isomorphDisplay.element.appendChild(isomorphDisplay.scoreElement);
    isomorphDisplay.element.onclick = () => selectIsomorph(pattern);

    ISOMORPH_CONTAINER_ELEMENT.appendChild(isomorphDisplay.element);
    isomorphDisplays[pattern] = isomorphDisplay;
}

TOGGLE_SHOW_NUMERIC_BUTTON_ELEMENT.onclick = () => toggleShowNumeric();
