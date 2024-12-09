const MESSAGE_OUTER_CONTAINER_ELEMENT = document.getElementById("messages-outer-container");
const MESSAGE_CONTAINER_ELEMENT = document.getElementById("messages-container");
const MESSAGE_LETTER_INDICES_ELEMENT = document.getElementById("messages-letter-indices");
const MESSAGE_ROW_INDICES_ELEMENT = document.getElementById("messages-row-indices");
const ISOMORPH_CONTAINER_ELEMENT = document.getElementById("isomorph-container");

let messageDisplays = [];
let isomorphDisplays = {};
let selectedPattern = null;

let maxLength = 0;
for (let i = 0; i < EYE_MESSAGES.length; i++) {
    let messageDisplay = {};
    messageDisplay.letters = [];
    messageDisplay.index = i;

    messageDisplay.element = document.createElement("div");
    messageDisplay.element.classList.add("message");

    maxLength = Math.max(maxLength, EYE_MESSAGES[i].length);
    for (let j = 0; j < EYE_MESSAGES[i].length; j++) {
        let letter = document.createElement("div");
        letter.textContent = EYE_MESSAGES[i][j].toString();
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

function setIsomorphLetters(index, start, length, toggle, pattern = "") {
    for (let i = 0; i < length; i++) {
        if (!toggle) {
            messageDisplays[index].letters[start + i].className = "";
            continue;
        }

        let letter = pattern[i] == "." ? "blank" : pattern[i];
        messageDisplays[index].letters[start + i].className = "letter-" + letter;
    }
}

function selectIsomorph(pattern) {
    if (selectedPattern != null) {
        isomorphDisplays[selectedPattern].element.classList.remove("selected");
        for (let instance of ISOMORPH_DATA[selectedPattern]) {
            setIsomorphLetters(instance[0], instance[1], selectedPattern.length, false);
        }
    }

    selectedPattern = pattern;

    if (selectedPattern != null) {
        isomorphDisplays[selectedPattern].element.classList.add("selected");
        for (let instance of ISOMORPH_DATA[selectedPattern]) {
            setIsomorphLetters(instance[0], instance[1], selectedPattern.length, true, pattern);
        }

        const letterElement = messageDisplays[ISOMORPH_DATA[selectedPattern][0][0]].letters[ISOMORPH_DATA[selectedPattern][0][1]];
        MESSAGE_OUTER_CONTAINER_ELEMENT.scrollLeft = letterElement.offsetLeft - 100;
    }
}

for (const pattern in ISOMORPH_DATA) {
    const isomorphData = ISOMORPH_DATA[pattern];
    let isomorphDisplay = {};

    isomorphDisplay.element = document.createElement("div");
    isomorphDisplay.element.classList.add("isomorph");

    isomorphDisplay.patternElement = document.createElement("div");
    isomorphDisplay.patternElement.classList.add("pattern");
    isomorphDisplay.patternElement.textContent = pattern;

    isomorphDisplay.labelElement = document.createElement("div");
    isomorphDisplay.labelElement.classList.add("label");
    isomorphDisplay.labelElement.textContent = "x" + isomorphData.length.toString();

    isomorphDisplay.element.appendChild(isomorphDisplay.patternElement);
    isomorphDisplay.element.appendChild(isomorphDisplay.labelElement);
    isomorphDisplay.element.onclick = () => selectIsomorph(pattern);

    ISOMORPH_CONTAINER_ELEMENT.appendChild(isomorphDisplay.element);
    isomorphDisplays[pattern] = isomorphDisplay;
}
