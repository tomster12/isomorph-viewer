class MessageView {
    constructor() {
        this.messagesViewElement = document.getElementById("messages-view");
        this.messagesContainerElement = document.getElementById("messages-container");
        this.messagesListElement = document.getElementById("messages-list");
        this.messagesLetterIndicesElement = document.getElementById("messages-letter-indices");
        this.messagesRowIndicesElement = document.getElementById("messages-row-indices");

        this.messageDisplays = [];
        this.maxLength = 0;
        this.showASCII = false;
        this.messagesInput = "";
        this.messagesParsed = [];

        this.messagesInput = EYE_MESSAGES_RAW;

        this.parseMessagesInput();
        this.reinitializeMessagesList();
    }

    parseMessagesInput() {
        this.messagesParsed = this.messagesInput.split("\n").map((message) => message.split(","));
    }

    reinitializeMessagesList() {
        for (let i = 0; i < this.messagesParsed.length; i++) {
            let messageDisplay = {};
            messageDisplay.visible = true;
            messageDisplay.letters = [];
            messageDisplay.index = i;

            messageDisplay.element = document.createElement("div");
            messageDisplay.element.classList.add("message");

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

    toggleShowASCII() {
        this.showASCII = !this.showASCII;
        for (let i = 0; i < this.messageDisplays.length; i++) {
            for (let j = 0; j < this.messageDisplays[i].letters.length; j++) {
                let letter = this.messageDisplays[i].letters[j];
                letter.textContent = this.showASCII ? String.fromCharCode(parseInt(this.messagesParsed[i][j]) + 32) : this.messagesParsed[i][j];
            }
        }
    }

    toggleIsomorphInstanceHighlighted(pattern, instance, toggle) {
        for (let i = 0; i < pattern.length; i++) {
            if (!toggle) {
                this.messageDisplays[instance[0]].letters[instance[1] + i].className = "";
                this.messageDisplays[instance[0]].letters[instance[1] + i].style.backgroundColor = "";
                this.messageDisplays[instance[0]].letters[instance[1] + i].style.color = "";
                continue;
            }

            let colours = getColours(pattern[i]);
            this.messageDisplays[instance[0]].letters[instance[1] + i].className = "highlighted";
            this.messageDisplays[instance[0]].letters[instance[1] + i].style.backgroundColor = colours.bg;
            this.messageDisplays[instance[0]].letters[instance[1] + i].style.color = colours.fg;
        }
    }

    scrollTo(element) {
        this.messagesContainerElement.scrollLeft = element.offsetLeft - 100;
    }
}

class IsomorphCalculator {
    constructor() {
        this.generateButtonElement = document.getElementById("isomorph-calculator-generate-button");
        this.generateButtonElement.onclick = () => this.generateIsomorphs();
    }

    toggleGenerateButtonSpinner(toggle) {
        this.generateButtonElement.innerHTML = toggle ? "<div class='spinner'></div>" : "<div class='label'>Generate</div>";
    }

    generateIsomorphs() {
        this.toggleGenerateButtonSpinner(true);
    }
}

class IsomorphView {
    constructor(messageView) {
        this.isomorphListElement = document.getElementById("isomorphs-list");
        this.isomorphDisplays = {};
        this.selectedPattern = null;
        this.messageView = messageView;

        this.initializeIsomorphs();
    }

    initializeIsomorphs() {
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
            isomorphDisplay.element.onclick = () => this.selectIsomorph(pattern);

            this.isomorphListElement.appendChild(isomorphDisplay.element);
            this.isomorphDisplays[pattern] = isomorphDisplay;
        }
    }

    selectIsomorph(pattern) {
        if (this.selectedPattern != null) {
            this.isomorphDisplays[this.selectedPattern].element.classList.remove("selected");
            for (let instance of ISOMORPH_DATA[this.selectedPattern].instances) {
                this.messageView.toggleIsomorphInstanceHighlighted(this.selectedPattern, instance, false);
            }
        }

        if (this.selectedPattern == pattern) {
            this.selectedPattern = null;
            return;
        }

        this.selectedPattern = pattern;

        if (this.selectedPattern != null) {
            this.isomorphDisplays[this.selectedPattern].element.classList.add("selected");

            let leftmostIndex = Infinity;
            let leftmostIndexMessage = null;

            for (let instance of ISOMORPH_DATA[this.selectedPattern].instances) {
                this.messageView.toggleIsomorphInstanceHighlighted(this.selectedPattern, instance, true);

                if (this.messageView.messageDisplays[instance[0]].visible && instance[1] < leftmostIndex) {
                    leftmostIndex = instance[1];
                    leftmostIndexMessage = instance[0];
                }
            }

            const letterElement = this.messageView.messageDisplays[leftmostIndexMessage].letters[leftmostIndex];
            this.messageView.scrollTo(letterElement);
        }
    }
}

function setupToolbarListeners(messageView) {
    const toggleShowASCIIButtonElement = document.getElementById("toggle-show-ascii-button");
    toggleShowASCIIButtonElement.onclick = () => {
        messageView.toggleShowASCII();
        toggleShowASCIIButtonElement.classList.toggle("toggled", messageView.showASCII);
    };
}

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

const messageView = new MessageView();
const isomorphCalculator = new IsomorphCalculator();
const isomorphView = new IsomorphView(messageView);

setupToolbarListeners(messageView);
