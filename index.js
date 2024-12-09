const MESSAGE_SELECTOR_CONTAINER_ELEMENT = document.getElementById("messages-selector-container");
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

function updateIsomorphLabels() {
    for (const pattern in ISOMORPH_DATA) {
        const isomorphData = ISOMORPH_DATA[pattern];
        let isomorphDisplay = isomorphDisplays[pattern];

        let visibleInstances = 0;
        for (let instance of isomorphData) {
            if (messageDisplays[instance[0]].visible) visibleInstances++;
        }

        isomorphDisplay.labelElement.textContent = "x" + visibleInstances.toString();
    }
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

    if (selectedPattern == pattern) {
        selectedPattern = null;
        return;
    }

    selectedPattern = pattern;

    if (selectedPattern != null) {
        isomorphDisplays[selectedPattern].element.classList.add("selected");
        let leftmostIndex = Infinity;
        let leftmostIndexMessage = null;
        for (let instance of ISOMORPH_DATA[selectedPattern]) {
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
        let instances = ISOMORPH_DATA[pattern];
        let visibleCount = 0;
        for (let instance of instances) {
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
