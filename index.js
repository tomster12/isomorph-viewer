const MESSAGE_SELECTOR_CONTAINER_ELEMENT = document.getElementById("messages-selector-container");
const MESSAGE_OUTER_CONTAINER_ELEMENT = document.getElementById("messages-outer-container");
const MESSAGE_CONTAINER_ELEMENT = document.getElementById("messages-container");
const MESSAGE_LETTER_INDICES_ELEMENT = document.getElementById("messages-letter-indices");
const MESSAGE_ROW_INDICES_ELEMENT = document.getElementById("messages-row-indices");
const ISOMORPH_CONTAINER_ELEMENT = document.getElementById("isomorph-container");
const TOGGLE_ASCII_BUTTON_ELEMENT = document.getElementById("toggle-ascii-button");

let messageDisplays = [];
let isomorphDisplays = {};
let selectedPattern = null;
let maxLength = 0;
let asciiToggled = false;

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
            return { bg: "#5c697d", fg: "#3e3e40" };

        case "A":
            return { bg: "#d36862", fg: "#323233" };

        case "B":
            return { bg: "#c4ee6a", fg: "#323233" };

        case "C":
            return { bg: "#5ddbe2", fg: "#323233" };

        case "D":
            return { bg: "#e076c7", fg: "#323233" };

        case "E":
            return { bg: "#5cdd53", fg: "#323233" };

        case "F":
            return { bg: "#4781ff", fg: "#323233" };
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

function toggleMessage(index) {
    let newVisible = !messageDisplays[index].visible;
    messageDisplays[index].visible = newVisible;

    // Toggle message selector class
    let messageSelectElement = MESSAGE_SELECTOR_CONTAINER_ELEMENT.children[index];
    messageSelectElement.classList.toggle("selected", newVisible);

    // Toggle visible in row indices
    let rowElement = MESSAGE_ROW_INDICES_ELEMENT.children[index];
    rowElement.style.display = newVisible ? "block" : "none";

    // Toggle visible in messages list
    let messageElement = MESSAGE_CONTAINER_ELEMENT.children[index];
    messageElement.style.display = newVisible ? "flex" : "none";

    // Filter out isomorphs that do not include 2 instances in the visible messages
    for (const pattern in ISOMORPH_DATA) {
        let visibleCount = 0;
        for (let instance of ISOMORPH_DATA[pattern].instances) {
            if (messageDisplays[instance[0]].visible) visibleCount++;
        }

        const isVisible = visibleCount >= 2;
        let isomorphDisplay = isomorphDisplays[pattern];
        isomorphDisplay.element.style.display = isVisible ? "flex" : "none";

        if (!isVisible && selectedPattern == pattern) {
            selectIsomorph(null);
        }
    }

    updateIsomorphLabels();
}

function toggleAscii() {
    asciiToggled = !asciiToggled;
    for (let i = 0; i < messageDisplays.length; i++) {
        for (let j = 0; j < messageDisplays[i].letters.length; j++) {
            let letter = messageDisplays[i].letters[j];
            letter.textContent = asciiToggled ? String.fromCharCode(EYE_MESSAGES[i][j] + 32) : EYE_MESSAGES[i][j].toString();
        }
    }
    TOGGLE_ASCII_BUTTON_ELEMENT.classList.toggle("toggled", asciiToggled);
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
        letter.textContent = EYE_MESSAGES[i][j].toString();
        messageDisplay.element.appendChild(letter);
        messageDisplay.letters.push(letter);
    }

    MESSAGE_CONTAINER_ELEMENT.appendChild(messageDisplay.element);
    messageDisplays.push(messageDisplay);

    let rowIndexElement = document.createElement("div");
    rowIndexElement.textContent = i.toString();
    MESSAGE_ROW_INDICES_ELEMENT.appendChild(rowIndexElement);

    let messageSelectElement = document.createElement("div");
    messageSelectElement.textContent = i.toString();
    messageSelectElement.className = "selected";
    messageSelectElement.onclick = () => toggleMessage(i);
    MESSAGE_SELECTOR_CONTAINER_ELEMENT.appendChild(messageSelectElement);
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

TOGGLE_ASCII_BUTTON_ELEMENT.onclick = () => toggleAscii();
