const MESSAGE_VIEW = document.getElementById("message-view");
const ISOMORPH_VIEW = document.getElementById("isomorph-view");

let messageDisplays = [];
let isomorphDisplays = {};
let selectedPattern = null;

for (let i = 0; i < EYE_MESSAGES.length; i++) {
    let messageDisplay = {};
    messageDisplay.letters = [];
    messageDisplay.index = i;

    messageDisplay.element = document.createElement("div");
    messageDisplay.element.classList.add("message");

    for (let j = 0; j < EYE_MESSAGES[i].length; j++) {
        let letter = document.createElement("div");
        letter.textContent = EYE_MESSAGES[i][j].toString();
        messageDisplay.element.appendChild(letter);
        messageDisplay.letters.push(letter);
    }

    MESSAGE_VIEW.appendChild(messageDisplay.element);
    messageDisplays.push(messageDisplay);
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
        MESSAGE_VIEW.scrollLeft = letterElement.offsetLeft - 100;
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

    ISOMORPH_VIEW.appendChild(isomorphDisplay.element);
    isomorphDisplays[pattern] = isomorphDisplay;
}
