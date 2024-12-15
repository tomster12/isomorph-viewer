function getColours(letter) {
    switch (letter) {
        case ".":
            return { bg: "#8792a0", fg: "#3c3e3f" };

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

function getCombinations(arr, k) {
    const result = [];
    const combination = Array(k).fill(0);
    function generateCombinations(start, depth) {
        if (depth === k) {
            result.push(combination.slice());
            return;
        }
        for (let i = start; i < arr.length; i++) {
            combination[depth] = arr[i];
            generateCombinations(i + 1, depth + 1);
        }
    }
    generateCombinations(0, 0);
    return result;
}

function cartesianProduct(...arrays) {
    return arrays.reduce(
        (acc, curr) => {
            return acc.flatMap((x) => curr.map((y) => [...x, y]));
        },
        [[]]
    );
}

function calculateSubPatterns(pattern, maxSymbolsRemoved) {
    // Calculate some basic information about the pattern
    const symbols = new Set(pattern.split("").filter((char) => char !== "."));
    const symbolInnerIndices = {};
    const symbolCounts = {};

    symbols.forEach((symbol) => {
        symbolInnerIndices[symbol] = [];
        symbolCounts[symbol] = 0;
    });

    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== ".") {
            if (i > 0 && i < pattern.length - 1) {
                symbolInnerIndices[pattern[i]].push(i);
            }
            symbolCounts[pattern[i]] += 1;
        }
    }

    // Calculate all combinations of removable repeats for each symbol
    const symbolRemoveCombos = {};
    symbols.forEach((symbol) => {
        symbolRemoveCombos[symbol] = [[]];
        for (let removeCount = 1; removeCount <= symbolInnerIndices[symbol].length; removeCount++) {
            if (symbolCounts[symbol] - removeCount !== 1) {
                const combos = getCombinations(symbolInnerIndices[symbol], removeCount);
                symbolRemoveCombos[symbol].push(...combos);
            }
        }
    });

    // Calculate all combinations of symbol removal combinations
    const subPatterns = [];
    const multisymbolRemoveCombos = cartesianProduct(...Array.from(symbols).map((symbol) => symbolRemoveCombos[symbol]));
    multisymbolRemoveCombos.forEach((multisymbolRemoveCombo) => {
        // Dont allow the no-change combo
        if (multisymbolRemoveCombo.every((combo) => combo.length === 0)) return;

        // Dont allow removing more symbols than the max
        const symbolDifference = multisymbolRemoveCombo.reduce((acc, combo) => acc + combo.length, 0);
        if (symbolDifference <= maxSymbolsRemoved) {
            let rawSubPattern = pattern.split("");
            multisymbolRemoveCombo.forEach((indices) => {
                indices.forEach((index) => {
                    rawSubPattern[index] = ".";
                });
            });
            rawSubPattern = rawSubPattern.join("");

            // Remap symbols to be clean
            const remap = { ".": "." };
            let i = 0;
            let finalSubPattern = [];
            for (let symbol of rawSubPattern) {
                if (!remap[symbol]) {
                    remap[symbol] = String.fromCharCode(65 + i);
                    i += 1;
                }
                finalSubPattern.push(remap[symbol]);
            }
            finalSubPattern = finalSubPattern.join("");

            // Add the final sub pattern to the list
            subPatterns.push({
                pattern: finalSubPattern,
                distance: symbolDifference,
            });
        }
    });

    return subPatterns;
}

function calculateIsomorphs(messages, alphabetSize, maxLength) {
    let isomorphs = {};

    // For each pattern length from each letter in each message
    for (let patternLength = 2; patternLength <= maxLength; patternLength++) {
        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
            for (let letterIndex = 0; letterIndex < messages[messageIndex].length - patternLength + 1; letterIndex++) {
                let sequence = messages[messageIndex].slice(letterIndex, letterIndex + patternLength);

                // Early check that the sequence encapsulates some meaningful repeats by checking either:
                // - The sequence start and end values are equal
                // - One of the start and end values are included in the inner sequence
                if (sequence[0] != sequence[sequence.length - 1]) {
                    let foundStart = false;
                    let foundEnd = false;
                    for (let i = 1; i < sequence.length - 1; i++) {
                        if (sequence[i] == sequence[0]) {
                            foundStart = true;
                        }
                        if (sequence[i] == sequence[sequence.length - 1]) {
                            foundEnd = true;
                        }
                        if (foundStart && foundEnd) {
                            break;
                        }
                    }
                    if (!(foundStart && foundEnd)) {
                        continue;
                    }
                }

                // Get pattern by mapping letters with count > 1 to A, B, C, etc.
                let letterMapping = {};
                let letterCounts = {};
                for (let letter of sequence) {
                    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
                }
                let pattern = "";
                for (let letter of sequence) {
                    if (letterCounts[letter] > 1 && !letterMapping[letter]) {
                        letterMapping[letter] = String.fromCharCode(65 + Object.keys(letterMapping).length);
                    }
                    pattern += letterMapping[letter] || ".";
                }

                // Update list of isomorphs with this pattern and track this instance of it
                if (!isomorphs[pattern]) {
                    isomorphs[pattern] = { score: 0, instances: [] };
                }
                isomorphs[pattern].instances.push([messageIndex, letterIndex]);
            }
        }
    }

    // Calculate score for each isomorph group
    for (let pattern in isomorphs) {
        const isomorph = isomorphs[pattern];
        const isomorphLength = pattern.length;
        const isomorphInstances = isomorph.instances.length;

        if (isomorphInstances === 1) continue;

        let isomorphLettersUsed = new Set();
        let internalRepeatCount = 0;

        for (let letter of pattern) {
            if (letter === ".") continue;
            if (!isomorphLettersUsed.has(letter)) {
                isomorphLettersUsed.add(letter);
            } else {
                internalRepeatCount++;
            }
        }

        if (internalRepeatCount === 1) continue;

        const isoProbability = 1 / Math.pow(alphabetSize, internalRepeatCount);
        const isoScore = -Math.log10(isoProbability);
        const groupIsoScore = isoScore * isomorphInstances;

        isomorph.score = groupIsoScore;
    }

    return isomorphs;
}

class MessageView {
    constructor() {
        this.messagesViewElement = document.getElementById("messages-view");
        this.messagesContainerElement = document.getElementById("messages-container");
        this.messagesInputElement = document.getElementById("messages-input");
        this.messagesListElement = document.getElementById("messages-list");
        this.messagesLetterIndicesElement = document.getElementById("messages-letter-indices");
        this.messagesRowIndicesElement = document.getElementById("messages-row-indices");
        this.toggleShowInputButtonElement = document.getElementById("toggle-show-input-button");
        this.toggleShowASCIIButtonElement = document.getElementById("toggle-show-ascii-button");

        this.messageDisplays = [];
        this.maxLength = 0;
        this.messagesInput = "";
        this.messagesParsed = [];
        this.messagesAlphabet = [];
        this.showASCII = false;
        this.showInput = false;
        this.onMessagesChangedListeners = [];
        this.onShowAsciiChangedListeners = [];

        this.toggleShowInputButtonElement.onclick = () => this.toggleShowInput();
        this.toggleShowASCIIButtonElement.onclick = () => this.toggleShowASCII();
    }

    setMessageInput(input) {
        this.messagesInput = input;
        this.parseMessagesInput();
        this.reinitializeMessagesList();

        for (let listener of this.onMessagesChangedListeners) {
            listener();
        }
    }

    parseMessagesInput() {
        this.messagesParsed = this.messagesInput.split("\n").map((message) => message.split(",").filter((letter) => letter.length > 0));
        this.messagesParsed = this.messagesParsed.filter((message) => message.length > 0);
        this.messagesAlphabet = Array.from(new Set(this.messagesParsed.flat()));
    }

    reinitializeMessagesList() {
        this.messagesListElement.innerHTML = "";
        this.messagesLetterIndicesElement.innerHTML = "";
        this.messagesRowIndicesElement.innerHTML = "";
        this.messageDisplays = [];

        for (let i = 0; i < this.messagesParsed.length; i++) {
            let messageDisplay = {};
            messageDisplay.visible = true;
            messageDisplay.letters = [];
            messageDisplay.index = i;

            messageDisplay.element = document.createElement("div");
            messageDisplay.element.classList.add("main-message");

            this.maxLength = Math.max(this.maxLength, this.messagesParsed[i].length);
            for (let j = 0; j < this.messagesParsed[i].length; j++) {
                let letter = document.createElement("div");
                letter.textContent = this.showASCII ? String.fromCharCode(parseInt(this.messagesParsed[i][j]) + 32) : this.messagesParsed[i][j];
                messageDisplay.element.appendChild(letter);
                messageDisplay.letters.push(letter);
            }

            this.messagesListElement.appendChild(messageDisplay.element);
            this.messageDisplays.push(messageDisplay);

            let rowIndexElement = document.createElement("div");
            rowIndexElement.textContent = i.toString();
            this.messagesRowIndicesElement.appendChild(rowIndexElement);
        }

        for (let i = 0; i < this.maxLength; i++) {
            let rowIndexElement = document.createElement("div");
            rowIndexElement.textContent = i.toString();
            if (i.toString().length > 2) rowIndexElement.style.fontSize = "0.8em";
            this.messagesLetterIndicesElement.appendChild(rowIndexElement);
        }
    }

    toggleShowInput() {
        this.showInput = !this.showInput;

        // Show messages input and hide messages view
        if (this.showInput) {
            this.messagesContainerElement.style.display = "none";
            this.messagesInputElement.style.display = "block";
            this.messagesInputElement.value = this.messagesInput;
        }

        // Hide messages input and show messages view
        else {
            this.messagesContainerElement.style.display = "flex";
            this.messagesInputElement.style.display = "none";
            this.setMessageInput(this.messagesInputElement.value);
        }

        this.toggleShowInputButtonElement.classList.toggle("active", this.showInput);
    }

    toggleShowASCII() {
        this.showASCII = !this.showASCII;
        for (let i = 0; i < this.messageDisplays.length; i++) {
            for (let j = 0; j < this.messageDisplays[i].letters.length; j++) {
                let letter = this.messageDisplays[i].letters[j];
                letter.textContent = this.showASCII ? String.fromCharCode(parseInt(this.messagesParsed[i][j]) + 32) : this.messagesParsed[i][j];
            }
        }

        this.toggleShowASCIIButtonElement.classList.toggle("active", this.showASCII);

        for (let listener of this.onShowAsciiChangedListeners) {
            listener();
        }
    }

    highlightIsomorph(pattern, instance) {
        for (let i = 0; i < pattern.length; i++) {
            let colours = getColours(pattern[i]);
            this.messageDisplays[instance[0]].letters[instance[1] + i].className = "highlighted";
            this.messageDisplays[instance[0]].letters[instance[1] + i].style.backgroundColor = colours.bg;
            this.messageDisplays[instance[0]].letters[instance[1] + i].style.color = colours.fg;
        }
    }

    highlightSimilarIsomorph(pattern, similarPattern, instance) {
        for (let i = 0; i < pattern.length; i++) {
            if ((pattern[i] == ".") != (similarPattern[i] == ".")) {
                this.messageDisplays[instance[0]].letters[instance[1] + i].className = "highlighted warning";
            } else {
                let colours = getColours(pattern[i]);
                this.messageDisplays[instance[0]].letters[instance[1] + i].style.backgroundColor = colours.bg;
                this.messageDisplays[instance[0]].letters[instance[1] + i].style.color = colours.fg;
            }
        }
    }

    clearIsomorphHighlighting() {
        for (let message of this.messageDisplays) {
            for (let letter of message.letters) {
                letter.className = "";
                letter.style.backgroundColor = "";
                letter.style.color = "";
            }
        }
    }

    scrollTo(element) {
        this.messagesContainerElement.scrollLeft = element.offsetLeft - 100;
    }
}

class IsomorphCalculator {
    constructor(messageView) {
        this.calculatorElement = document.getElementById("isomorph-calculator");
        this.generateButtonElement = document.getElementById("isomorph-calculator-generate-button");
        this.inputMaxLengthElement = document.getElementById("isomorph-calculator-input-max-length");
        this.inputMinValuesElement = document.getElementById("isomorph-calculator-input-min-values");
        this.inputSharedSectionsElement = document.getElementById("isomorph-calculator-input-shared-sections");
        this.inputSubPatternsElement = document.getElementById("isomorph-calculator-input-sub-patterns");
        this.inputSubPatternMaxDiffElement = document.getElementById("isomorph-calculator-input-sub-patterns-max-diff");

        this.messageView = messageView;
        this.isomorphs = {};
        this.onGenerateIsomorphListeners = [];
        this.maxLength = 30;
        this.minValues = 2;
        this.allowSharedSections = false;
        this.generateSubPatterns = false;
        this.subPatternMaxDiff = 1;

        this.calculatorElement.addEventListener("keypress", (evt) => {
            if (evt.keyCode === 13) {
                evt.preventDefault();
                this.generate();
            }
        });

        this.inputSubPatternsElement.onchange = (e) => {
            this.inputSubPatternMaxDiffElement.parentElement.style.display = e.target.checked ? "flex" : "none";
        };
        this.inputSubPatternMaxDiffElement.parentElement.style.display = this.inputSubPatternsElement.checked ? "flex" : "none";

        this.generateButtonElement.onclick = () => this.generate();

        this.messageView.onMessagesChangedListeners.push(() => this.generate());
    }

    async generate() {
        this.toggleGenerateButtonSpinner(true);

        this.maxLength = parseInt(this.inputMaxLengthElement.value);
        this.minValues = parseInt(this.inputMinValuesElement.value);
        this.allowSharedSections = this.inputSharedSectionsElement.checked;
        this.generateSubPatterns = this.inputSubPatternsElement.checked;
        this.subPatternMaxDiff = parseInt(this.inputSubPatternMaxDiffElement.value);

        this.isomorphs = calculateIsomorphs(this.messageView.messagesParsed, this.messageView.messagesAlphabet.length, this.maxLength);

        // Filter isomorphs that have:
        // - At least 2 instances
        // - At least minValues distinct letters
        // - At least 2 distinct sequences if allowSharedSections is false

        for (let pattern in this.isomorphs) {
            let letterSet = new Set(pattern.split("").filter((char) => char !== "."));
            if (letterSet.size < this.minValues) {
                delete this.isomorphs[pattern];
                continue;
            }

            if (!this.allowSharedSections && this.isomorphs[pattern].instances.length > 1) {
                let sequenceSet = new Set();
                for (let instance of this.isomorphs[pattern].instances) {
                    const instanceList = this.messageView.messagesParsed[instance[0]].slice(instance[1], instance[1] + pattern.length);
                    const instanceString = instanceList.join(",");
                    sequenceSet.add(instanceString);
                }
                if (sequenceSet.size < 2) {
                    delete this.isomorphs[pattern];
                    continue;
                }
            }
        }

        // Calculate sub-patterns for the filtered isomorphs
        // We want to only add the sub-pattern as a nearby isomorph if it has an instance

        if (this.generateSubPatterns) {
            for (let pattern in this.isomorphs) {
                this.isomorphs[pattern].similarIsomorphs = [];
            }

            for (let pattern in this.isomorphs) {
                const subPatterns = calculateSubPatterns(pattern, this.subPatternMaxDiff);
                for (let subPattern of subPatterns) {
                    if (subPattern.pattern in this.isomorphs) {
                        this.isomorphs[pattern].similarIsomorphs.push(subPattern.pattern);
                        this.isomorphs[subPattern.pattern].similarIsomorphs.push(pattern);
                    }
                }
            }
        }

        // Filter out isomorphs with 1 instance if they have no similar isomorphs

        for (let pattern in this.isomorphs) {
            if (this.isomorphs[pattern].instances.length === 1 && (!this.generateSubPatterns || this.isomorphs[pattern].similarIsomorphs.length === 0)) {
                delete this.isomorphs[pattern];
            }
        }

        this.toggleGenerateButtonSpinner(false);

        for (let listener of this.onGenerateIsomorphListeners) {
            listener();
        }
    }

    toggleGenerateButtonSpinner(toggle) {
        this.generateButtonElement.innerHTML = toggle ? "<div class='spinner'></div>" : "<div class='label'>Generate</div>";
    }
}

class IsomorphView {
    constructor(messageView, isomorphCalculator) {
        this.isomorphListElement = document.getElementById("isomorphs-list");
        this.isomorphInfoElement = document.getElementById("isomorphs-info");
        this.isomorphsSelectionViewElement = document.getElementById("isomorph-selection-view");
        this.isomorphsSelectionPatternElement = document.getElementById("isomorph-selection-pattern");
        this.isomorphsSelectionListElement = document.getElementById("isomorph-selection-list");

        this.isomorphDisplays = {};
        this.selectedPattern = null;
        this.messageView = messageView;
        this.isomorphCalculator = isomorphCalculator;
        this.sortedIsomorphs = [];

        this.isomorphCalculator.onGenerateIsomorphListeners.push(() => this.reinitializeIsomorphs());
        this.messageView.onShowAsciiChangedListeners.push(() => this.updateIsomorphSelectionList());
    }

    reinitializeIsomorphs() {
        this.sortedIsomorphs = [];
        this.selectIsomorph(null);

        if (Object.keys(this.isomorphCalculator.isomorphs).length == 0) {
            this.isomorphListElement.innerHTML = "<div class='empty'>No isomorphs...</div>";
        } else {
            this.sortedIsomorphs = Object.keys(this.isomorphCalculator.isomorphs).sort(
                (a, b) => this.isomorphCalculator.isomorphs[b].score - this.isomorphCalculator.isomorphs[a].score
            );

            this.isomorphListElement.innerHTML = "";

            for (let pattern of this.sortedIsomorphs) {
                let isomorphDisplay = {};

                isomorphDisplay.element = document.createElement("div");
                isomorphDisplay.element.classList.add("isomorph");

                isomorphDisplay.patternElement = document.createElement("div");
                isomorphDisplay.patternElement.classList.add("pattern");
                isomorphDisplay.patternElement.textContent = pattern;

                isomorphDisplay.labelElement = document.createElement("div");
                isomorphDisplay.labelElement.classList.add("label");
                let text = this.isomorphCalculator.isomorphs[pattern].instances.length.toString();
                if (this.isomorphCalculator.generateSubPatterns && this.isomorphCalculator.isomorphs[pattern].similarIsomorphs.length > 0) {
                    let total = 0;
                    for (let similarPattern of this.isomorphCalculator.isomorphs[pattern].similarIsomorphs) {
                        total += this.isomorphCalculator.isomorphs[similarPattern].instances.length;
                    }
                    text += "(" + total + ")";
                }
                isomorphDisplay.labelElement.textContent = text;

                isomorphDisplay.scoreElement = document.createElement("div");
                isomorphDisplay.scoreElement.classList.add("score");
                isomorphDisplay.scoreElement.textContent = this.isomorphCalculator.isomorphs[pattern].score.toFixed(2);

                isomorphDisplay.element.appendChild(isomorphDisplay.patternElement);
                isomorphDisplay.element.appendChild(isomorphDisplay.labelElement);
                isomorphDisplay.element.appendChild(isomorphDisplay.scoreElement);
                isomorphDisplay.element.onclick = () => this.selectIsomorph(pattern);

                this.isomorphListElement.appendChild(isomorphDisplay.element);
                this.isomorphDisplays[pattern] = isomorphDisplay;
            }
        }

        this.isomorphInfoElement.innerHTML = "";

        let infoElement1 = document.createElement("div");
        infoElement1.textContent = "Total isomorphs: " + this.sortedIsomorphs.length;
        this.isomorphInfoElement.appendChild(infoElement1);

        let infoElement2 = document.createElement("div");
        let totalInstances = Object.values(this.isomorphCalculator.isomorphs).reduce((acc, val) => acc + val.instances.length, 0);
        infoElement2.textContent = "Total instances: " + totalInstances;
        this.isomorphInfoElement.appendChild(infoElement2);

        let infoElement3 = document.createElement("div");
        let totalScore = Object.values(this.isomorphCalculator.isomorphs).reduce((acc, val) => acc + val.score, 0);
        let avgScore = totalScore / this.sortedIsomorphs.length;
        infoElement3.textContent = "Total score: " + totalScore.toFixed(2) + " (avg. " + avgScore.toFixed(2) + ")";
        this.isomorphInfoElement.appendChild(infoElement3);
    }

    selectIsomorph(pattern) {
        // Remove old isomorph highlighting
        if (this.selectedPattern != null) {
            this.messageView.clearIsomorphHighlighting();
            if (this.isomorphDisplays[this.selectedPattern] != null) {
                this.isomorphDisplays[this.selectedPattern].element.classList.remove("selected");
            }
        }

        // Toggling current isomorph so just deselect
        if (this.selectedPattern == pattern) {
            this.selectedPattern = null;
            this.updateIsomorphSelectionList();
            return;
        }

        this.selectedPattern = pattern;

        // Selecting a new isomorph
        if (this.selectedPattern != null) {
            this.isomorphDisplays[this.selectedPattern].element.classList.add("selected");

            let leftmostIndex = Infinity;
            let leftmostIndexMessage = null;

            for (let instance of this.isomorphCalculator.isomorphs[this.selectedPattern].instances) {
                this.messageView.highlightIsomorph(this.selectedPattern, instance);

                if (this.messageView.messageDisplays[instance[0]].visible && instance[1] < leftmostIndex) {
                    leftmostIndex = instance[1];
                    leftmostIndexMessage = instance[0];
                }
            }

            for (let similarPattern of this.isomorphCalculator.isomorphs[this.selectedPattern].similarIsomorphs) {
                for (let instance of this.isomorphCalculator.isomorphs[similarPattern].instances) {
                    this.messageView.highlightSimilarIsomorph(this.selectedPattern, similarPattern, instance);

                    if (this.messageView.messageDisplays[instance[0]].visible && instance[1] < leftmostIndex) {
                        leftmostIndex = instance[1];
                        leftmostIndexMessage = instance[0];
                    }
                }
            }

            // Scroll to leftmost visible instance
            const letterElement = this.messageView.messageDisplays[leftmostIndexMessage].letters[leftmostIndex];
            this.messageView.scrollTo(letterElement);
        }

        this.updateIsomorphSelectionList();
    }

    updateIsomorphSelectionList() {
        if (this.selectedPattern == null) {
            this.isomorphsSelectionListElement.innerHTML = "<div class='empty'>No isomorphs...</div>";
            return;
        }

        this.isomorphsSelectionListElement.innerHTML = "";
        this.isomorphsSelectionPatternElement.innerText = this.selectedPattern;

        for (let instance of this.isomorphCalculator.isomorphs[this.selectedPattern].instances) {
            const selectionMessageElement = document.createElement("div");
            selectionMessageElement.classList.toggle("selection-message");

            for (let i = 0; i < this.selectedPattern.length; i++) {
                let letterElement = document.createElement("div");
                const value = this.messageView.messagesParsed[instance[0]][instance[1] + i];
                letterElement.textContent = this.messageView.showASCII ? String.fromCharCode(parseInt(value) + 32) : value;

                let colours = getColours(this.selectedPattern[i]);
                letterElement.style.backgroundColor = colours.bg;
                letterElement.style.color = colours.fg;

                letterElement.onclick = (e) => {
                    e.preventDefault();
                    const element = this.messageView.messageDisplays[instance[0]].letters[instance[1]];
                    this.messageView.scrollTo(element);
                };

                selectionMessageElement.appendChild(letterElement);
            }

            this.isomorphsSelectionListElement.appendChild(selectionMessageElement);
        }

        // A.BB.A similar [ A....A ]
        // A....A similar [ A.BB.A ]

        for (let similarPattern of this.isomorphCalculator.isomorphs[this.selectedPattern].similarIsomorphs) {
            for (let instance of this.isomorphCalculator.isomorphs[similarPattern].instances) {
                const selectionMessageElement = document.createElement("div");
                selectionMessageElement.classList.toggle("selection-message");

                for (let i = 0; i < this.selectedPattern.length; i++) {
                    let letterElement = document.createElement("div");
                    const value = this.messageView.messagesParsed[instance[0]][instance[1] + i];
                    letterElement.textContent = this.messageView.showASCII ? String.fromCharCode(parseInt(value) + 32) : value;

                    if ((this.selectedPattern[i] == ".") != (similarPattern[i] == ".")) {
                        letterElement.classList.add("warning");
                    } else {
                        let colours = getColours(this.selectedPattern[i]);
                        letterElement.style.backgroundColor = colours.bg;
                        letterElement.style.color = colours.fg;
                    }

                    letterElement.onclick = (e) => {
                        e.preventDefault();
                        const element = this.messageView.messageDisplays[instance[0]].letters[instance[1]];
                        this.messageView.scrollTo(element);
                    };

                    selectionMessageElement.appendChild(letterElement);
                }

                this.isomorphsSelectionListElement.appendChild(selectionMessageElement);
            }
        }
    }
}

const messageView = new MessageView();
const isomorphCalculator = new IsomorphCalculator(messageView);
const isomorphView = new IsomorphView(messageView, isomorphCalculator);

messageView.setMessageInput(EYE_MESSAGES_RAW);
