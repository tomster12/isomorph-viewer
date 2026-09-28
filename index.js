// -------------------- Utility/General --------------------

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
		[[]],
	);
}

function choose(n, k) {
	// n choose k binomial coefficient implementation
	// Could be memoized for now this is fine

	if (k > n / 2) k = n - k;

	let res = 1;
	for (let i = 1; i <= k; i++) {
		res *= (n - i + 1) / i;
	}

	return res;

	// Alternatively if we had BigNumber version of factorial could do this
	//return factorial(n)/(factorial(k)*factorial(n - k));
}

function hashString(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return hash >>> 0;
}

function hashInts(values) {
	let hash = 0;
	for (const value of values) hash ^= value;
	return hash >>> 0;
}

function unionSets(sets) {
	return new Set(sets.flatMap((set) => [...set]));
}

function setsEqual(a, b) {
	if (a.size !== b.size) return false;
	for (const value of a) if (!b.has(value)) return false;
	return true;
}

// -------------------- Utility/Page --------------------

function getLetterColour(letter) {
	switch (letter) {
		case ".": return { bg: "#8792a0", fg: "#3c3e3f" };
		case "A": return { bg: "#c7514b", fg: "#ffffff" };
		case "B": return { bg: "#5ab02c", fg: "#ffffff" };
		case "C": return { bg: "#cb9b00", fg: "#ffffff" };
		case "D": return { bg: "#e660c7", fg: "#ffffff" };
		case "E": return { bg: "#549c9f", fg: "#ffffff" };
		case "F": return { bg: "#4781ff", fg: "#ffffff" };
		case "G": return { bg: "#ff7e29", fg: "#ffffff" };
	}
	return { bg: "#9000ff", fg: "#3c3e3f" };
}

function getIndexedColour(value, darken = false) {
	const hueOffset = 140;
	const hue = (hueOffset + value * 137.508) % 360;

	let saturation = 30;
	let lightness = 50;
	if (darken) {
		lightness = Math.max(0, lightness - 15);
		saturation = Math.min(100, saturation - 5);
	}

	return { bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`, fg: "#ffffff" };
}

function filterIsomorphDisplaysByPosition(isomorphDisplays, isomorphs, position) {
	if (position == null) {
		for (let pattern in isomorphDisplays) isomorphDisplays[pattern].element.style.display = "flex";
		return;
	}

	for (let pattern in isomorphDisplays) {
		let included = false;
		for (let instance of isomorphs[pattern].instances) {
			if (instance[0] == position[0] && instance[1] <= position[1] && instance[1] + pattern.length > position[1]) {
				included = true;
				break;
			}
		}
		isomorphDisplays[pattern].element.style.display = included ? "flex" : "none";
	}
}

function createIsomorphDisplayElement(pattern, isomorph, labelText, onClick) {
	const element = document.createElement("div");
	element.classList.add("isomorph");

	const patternElement = document.createElement("div");
	patternElement.classList.add("pattern");
	patternElement.textContent = pattern;

	const labelElement = document.createElement("div");
	labelElement.classList.add("label");
	labelElement.textContent = labelText;

	const scoreElement = document.createElement("div");
	scoreElement.classList.add("score");
	scoreElement.textContent = isomorph.score.toFixed(2);

	element.appendChild(patternElement);
	element.appendChild(labelElement);
	element.appendChild(scoreElement);
	element.onclick = onClick;

	return { element, patternElement, labelElement, scoreElement };
}

function renderIsomorphDisplaysInfo(container, isomorphs, sortedPatterns, includeScore) {
	container.innerHTML = "";

	const patternsElement = document.createElement("div");
	patternsElement.textContent = "Total patterns: " + sortedPatterns.length;
	container.appendChild(patternsElement);

	const totalInstances = Object.values(isomorphs).reduce((accumulatedInstances, isomorph) => accumulatedInstances + isomorph.instances.length, 0);
	const instancesElement = document.createElement("div");
	instancesElement.textContent = "Total instances: " + totalInstances;
	container.appendChild(instancesElement);

	if (includeScore) {
		const totalScore = Object.values(isomorphs).reduce((accumulatedScore, isomorph) => accumulatedScore + isomorph.score, 0);
		const averageScore = sortedPatterns.length > 0 ? totalScore / sortedPatterns.length : 0;
		const scoreElement = document.createElement("div");
		scoreElement.textContent = "Total score: " + totalScore.toFixed(2) + " (avg. " + averageScore.toFixed(2) + ")";
		container.appendChild(scoreElement);
	}
}

// -------------------- Utility/Isomorphs --------------------

function getCorePatternIndices(pattern) {
	let start = 0;
	let end = pattern.length - 1;
	while (start <= end && pattern[start] === ".") start++;
	while (end >= start && pattern[end] === ".") end--;
	return [start, end];
}

function getCorePattern(pattern) {
	const [start, end] = getCorePatternIndices(pattern);
	return pattern.slice(start, end + 1);
}

function removeOverlappingInstances(instances, patternLength) {
	const instancesByMessage = new Map();
	for (const instance of instances) {
		const messageIndex = instance[0];
		if (!instancesByMessage.has(messageIndex)) instancesByMessage.set(messageIndex, []);
		instancesByMessage.get(messageIndex).push(instance);
	}

	const filteredInstances = [];
	for (const messageInstances of instancesByMessage.values()) {
		messageInstances.sort((a, b) => a[1] - b[1]);
		let lastEnd = -Infinity;

		for (const instance of messageInstances) {
			const start = instance[1];
			const end = start + patternLength;
			if (start >= lastEnd) {
				filteredInstances.push(instance);
				lastEnd = end;
			}
		}
	}

	return filteredInstances;
}

function mergeAdjacentSequences(combinedValues) {
	let maxLength = 0;
	for (const row of combinedValues) maxLength = Math.max(maxLength, row.length);

	const taken = combinedValues.map((row) => row.map(() => false));
	const buckets = new Map();

	for (let sequenceLength = maxLength; sequenceLength >= 1; sequenceLength--) {
		for (let messageIndex = 0; messageIndex < combinedValues.length; messageIndex++) {
			const row = combinedValues[messageIndex];
			for (let start = 0; start + sequenceLength <= row.length; start++) {
				let sequence = [];
				let valid = true;
				for (let offset = 0; offset < sequenceLength; offset++) {
					if (row[start + offset] == null) {
						valid = false;
						break;
					}
					sequence.push(row[start + offset]);
				}
				if (!valid) continue;

				const sequenceKey = hashString(sequence.join("|"));
				if (!buckets.has(sequenceKey)) buckets.set(sequenceKey, []);
				buckets.get(sequenceKey).push({ messageIndex, start, length: sequenceLength });
			}
		}
	}

	const bucketList = [];
	for (const [key, instances] of buckets) {
		if (instances.length < 2) continue;
		if (instances[0].length < 3) continue;
		bucketList.push({ key, instances, length: instances[0].length });
	}
	bucketList.sort((a, b) => b.length - a.length);

	const mergedValues = combinedValues.map((row) => row.slice());

	for (const { key, instances, length } of bucketList) {
		for (const { messageIndex, start } of instances) {
			let free = true;
			for (let offset = 0; offset < length; offset++) {
				if (taken[messageIndex][start + offset]) {
					free = false;
					break;
				}
			}
			if (!free) continue;

			for (let offset = 0; offset < length; offset++) {
				mergedValues[messageIndex][start + offset] = key;
				taken[messageIndex][start + offset] = true;
			}
		}
	}

	return mergedValues;
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

function calculateIsomorphs(messages, alphabetSize, maxLength, extendPatterns) {
	let isomorphs = {};

	const totalMessageLength = messages.reduce((sum, message) => sum + message.length, 0);

	// For each pattern length from each letter in each message
	for (let patternLength = 2; patternLength <= maxLength; patternLength++) {
		for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
			for (let letterIndex = 0; letterIndex < messages[messageIndex].length - patternLength + 1; letterIndex++) {
				let sequence = messages[messageIndex].slice(letterIndex, letterIndex + patternLength);

				// Unless we are extending, only keep sequences that encapsulate some meaningful repeat by checking either:
				// - The sequence start and end values are equal
				// - One of the start and end values are included in the inner sequence
				if (!extendPatterns) {
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

				// When extending, a fully unique sequence produces an all-dot pattern which is meaningless
				if (Object.keys(letterMapping).length == 0) continue;

				// Update list of isomorphs with this pattern and track this instance of it
				if (!isomorphs[pattern]) {
					isomorphs[pattern] = { score: 0, instances: [], similarIsomorphs: [], repeats: 0 };
				}
				isomorphs[pattern].instances.push([messageIndex, letterIndex]);
				isomorphs[pattern].repeats = Object.values(letterCounts)
					.filter((count) => count > 1)
					.reduce((accumulatedRepeats, count) => accumulatedRepeats + (count - 1), 0);
			}
		}
	}

	// When extending, merge every pattern sharing a core pattern and instance count down to the largest one
	if (extendPatterns) {
		const largestPatternByCore = {};
		for (let pattern in isomorphs) {
			const corePattern = getCorePattern(pattern);
			const instanceCount = isomorphs[pattern].instances.length;
			const key = corePattern + ":" + instanceCount;

			if (!largestPatternByCore[key] || pattern.length > largestPatternByCore[key].length) {
				largestPatternByCore[key] = pattern;
			}
		}

		const extendedIsomorphs = {};
		for (let key in largestPatternByCore) {
			const pattern = largestPatternByCore[key];
			extendedIsomorphs[pattern] = isomorphs[pattern];
		}
		isomorphs = extendedIsomorphs;
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

		// Simplified calculation
		//const isoScore = -Math.log10(isoProbability);
		//const groupIsoScore = isoScore * isomorphInstances;

		// More precise calculation taking into account the length, assuming binomially distributed occurrences
		// Calculating p(occurrences >= isomorphInstances), truncating the sum because eventually the contributions will be small
		const trialCount = totalMessageLength - messages.length * isomorphLength;
		let totalProbability = 0.0;
		let lastProbability = 0.0;
		for (let occurrences = isomorphInstances; occurrences < isomorphInstances + 30; occurrences++) {
			totalProbability += choose(trialCount, occurrences) * Math.pow(1 - isoProbability, trialCount - occurrences) * Math.pow(isoProbability, occurrences);
			// Precision limit reached, end early
			if (totalProbability == lastProbability) break;
			lastProbability = totalProbability;
		}
		const groupIsoScore = -Math.log10(totalProbability);

		isomorph.score = groupIsoScore;
	}

	return isomorphs;
}

// -------------------- Page --------------------

class MessageView {
	constructor() {
		this.messagesViewElement = document.getElementById("messages-view");
		this.messagesContainerElement = document.getElementById("messages-container");
		this.messagesInputElement = document.getElementById("messages-input");
		this.messagesListElement = document.getElementById("messages-list");
		this.messagesLetterIndicesElement = document.getElementById("messages-letter-indices");
		this.messagesRowIndicesElement = document.getElementById("messages-row-indices");
		this.toggleShowInputButtonElement = document.getElementById("toggle-show-input-button");
		this.toggleParseASCIIButtonElement = document.getElementById("toggle-parse-ascii-button");
		this.toggleShowASCIIButtonElement = document.getElementById("toggle-show-ascii-button");

		this.messageDisplays = [];
		this.maxLength = 0;
		this.messagesInput = "";
		this.messagesParsed = [];
		this.messagesAlphabet = [];
		this.showInput = false;
		this.parseASCII = false;
		this.showASCII = false;
		this.onMessagesChangedListeners = [];
		this.onShowAsciiChangedListeners = [];
		this.onLetterClickListeners = [];
		this.selectedLetterPosition = null;

		this.toggleShowInputButtonElement.onclick = () => this.toggleShowInput();
		this.toggleParseASCIIButtonElement.onclick = () => this.toggleParseASCII();
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
		const lines = this.messagesInput.split("\n");
		if (this.parseASCII) {
			this.messagesParsed = lines.map((message) =>
				message
					.split("")
					.filter((letter) => letter.length > 0)
					.map((letter) => letter.charCodeAt(0) - 32),
			);
		} else {
			this.messagesParsed = lines.map((message) =>
				message
					.split(",")
					.filter((letter) => letter.length > 0)
					.map((letter) => parseInt(letter)),
			);
		}
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
				letter.textContent = this.showASCII ? String.fromCharCode(this.messagesParsed[i][j] + 32) : this.messagesParsed[i][j];
				letter.onclick = () => this.triggerLetterClick(i, j);
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

	toggleParseASCII() {
		this.parseASCII = !this.parseASCII;
		this.parseMessagesInput();
		this.reinitializeMessagesList();

		for (let listener of this.onMessagesChangedListeners) {
			listener();
		}

		this.toggleParseASCIIButtonElement.classList.toggle("active", this.parseASCII);
	}

	toggleShowASCII() {
		this.showASCII = !this.showASCII;
		for (let i = 0; i < this.messageDisplays.length; i++) {
			for (let j = 0; j < this.messageDisplays[i].letters.length; j++) {
				let letter = this.messageDisplays[i].letters[j];
				letter.textContent = this.showASCII ? String.fromCharCode(this.messagesParsed[i][j] + 32) : this.messagesParsed[i][j];
			}
		}

		this.toggleShowASCIIButtonElement.classList.toggle("active", this.showASCII);

		for (let listener of this.onShowAsciiChangedListeners) {
			listener();
		}
	}

	highlightIsomorph(pattern, instance) {
		for (let i = 0; i < pattern.length; i++) {
			let colours = getLetterColour(pattern[i]);
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
				let colours = getLetterColour(pattern[i]);
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

	triggerLetterClick(messageIndex, letterIndex) {
		for (let listener of this.onLetterClickListeners) {
			listener(messageIndex, letterIndex);
		}
	}

	setSelectedLetterPosition(position) {
		if (this.selectedLetterPosition != null) {
			this.messageDisplays[this.selectedLetterPosition[0]].letters[this.selectedLetterPosition[1]].classList.remove("outlined");
		}

		const isSamePosition =
			this.selectedLetterPosition != null &&
			position != null &&
			this.selectedLetterPosition[0] == position[0] &&
			this.selectedLetterPosition[1] == position[1];

		this.selectedLetterPosition = isSamePosition ? null : position;

		if (this.selectedLetterPosition != null) {
			this.messageDisplays[this.selectedLetterPosition[0]].letters[this.selectedLetterPosition[1]].classList.add("outlined");
		}

		return this.selectedLetterPosition;
	}

	setClickableLetters(isClickable) {
		this.messagesListElement.classList.toggle("clickable-letters", isClickable);
	}

	setLetterStyle(messageIndex, letterIndex, colours, highlighted = false) {
		const element = this.messageDisplays[messageIndex].letters[letterIndex];
		element.style.backgroundColor = colours ? colours.bg : "";
		element.style.color = colours ? colours.fg : "";
		element.classList.toggle("highlighted", highlighted);
	}

	highlightMessagesUniform(colours = null, highlighted = false) {
		for (let messageDisplay of this.messageDisplays) {
			for (let letterIndex = 0; letterIndex < messageDisplay.letters.length; letterIndex++) {
				this.setLetterStyle(messageDisplay.index, letterIndex, colours, highlighted);
			}
		}
	}
}

class IsomorphCalculator {
	constructor(messageView) {
		this.calculatorElement = document.getElementById("isomorph-calculator");
		this.generateButtonElement = document.getElementById("isomorph-calculator-generate-button");
		this.inputMaxLengthElement = document.getElementById("isomorph-calculator-input-max-length");
		this.inputMinValuesElement = document.getElementById("isomorph-calculator-input-min-values");
		this.inputSharedSectionsElement = document.getElementById("isomorph-calculator-input-shared-sections");
		this.inputExtendElement = document.getElementById("isomorph-calculator-input-extend");
		this.inputSubPatternsElement = document.getElementById("isomorph-calculator-input-sub-patterns");
		this.inputRemoveOverlapsElement = document.getElementById("isomorph-calculator-input-remove-overlaps");
		this.inputSubPatternMaxDiffElement = document.getElementById("isomorph-calculator-input-sub-patterns-max-diff");

		this.messageView = messageView;
		this.isomorphs = {};
		this.onGenerateIsomorphListeners = [];
		this.maxLength = 30;
		this.minValues = 2;
		this.allowSharedSections = false;
		this.toExtend = false;
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
		this.toExtend = this.inputExtendElement.checked;
		this.generateSubPatterns = this.inputSubPatternsElement.checked;
		this.removeOverlaps = this.inputRemoveOverlapsElement.checked;
		this.subPatternMaxDiff = parseInt(this.inputSubPatternMaxDiffElement.value);

		this.isomorphs = calculateIsomorphs(this.messageView.messagesParsed, this.messageView.messagesAlphabet.length, this.maxLength, this.toExtend);

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

		// Remove overlapping instances of each isomorph

		if (this.removeOverlaps) {
			for (let pattern in this.isomorphs) {
				const filteredInstances = removeOverlappingInstances(this.isomorphs[pattern].instances, pattern.length);

				if (filteredInstances.length < 2) {
					delete this.isomorphs[pattern];
				} else {
					this.isomorphs[pattern].instances = filteredInstances;
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
		this.isomorphsViewElement = document.getElementById("isomorphs-view");
		this.isomorphListElement = document.getElementById("isomorphs-list");
		this.isomorphInfoElement = document.getElementById("isomorphs-info");
		this.isomorphsSelectionViewElement = document.getElementById("isomorph-selection-view");
		this.isomorphsSelectionPatternContainerElement = document.getElementById("isomorph-selection-pattern-container");
		this.isomorphsSelectionPatternElement = document.getElementById("isomorph-selection-pattern");
		this.isomorphsSelectionStatsElement = document.getElementById("isomorph-selection-stats");
		this.isomorphsSelectionListElement = document.getElementById("isomorph-selection-list");

		this.isomorphDisplays = {};
		this.selectedPattern = null;
		this.messageView = messageView;
		this.isomorphCalculator = isomorphCalculator;
		this.sortedIsomorphs = [];
		this.isActive = false;

		this.isomorphCalculator.onGenerateIsomorphListeners.push(() => this.reinitializeIsomorphs());
		this.messageView.onShowAsciiChangedListeners.push(() => this.updateIsomorphSelectionList());

		this.messageView.onLetterClickListeners.push((messageIndex, letterIndex) => {
			if (!this.isActive) return;
			const position = this.messageView.setSelectedLetterPosition([messageIndex, letterIndex]);
			filterIsomorphDisplaysByPosition(this.isomorphDisplays, this.isomorphCalculator.isomorphs, position);
		});
	}

	setActive(isActive) {
		this.isActive = isActive;
		this.isomorphsViewElement.style.display = isActive ? "flex" : "none";
		this.isomorphsSelectionViewElement.style.display = isActive ? "flex" : "none";
		this.messageView.setClickableLetters(isActive);

		if (isActive) {
			if (this.selectedPattern != null) {
				const pattern = this.selectedPattern;
				this.selectedPattern = null;
				this.selectIsomorph(pattern);
			}
		} else {
			this.messageView.clearIsomorphHighlighting();
			this.messageView.setSelectedLetterPosition(null);
		}
	}

	reinitializeIsomorphs() {
		this.sortedIsomorphs = [];
		this.selectIsomorph(null);

		if (Object.keys(this.isomorphCalculator.isomorphs).length == 0) {
			this.isomorphListElement.innerHTML = "<div class='empty'>No isomorphs...</div>";
		} else {
			this.sortedIsomorphs = Object.keys(this.isomorphCalculator.isomorphs).sort(
				(a, b) => this.isomorphCalculator.isomorphs[b].score - this.isomorphCalculator.isomorphs[a].score,
			);

			this.isomorphListElement.innerHTML = "";

			for (let pattern of this.sortedIsomorphs) {
				const isomorph = this.isomorphCalculator.isomorphs[pattern];

				let labelText = isomorph.instances.length.toString();
				if (this.isomorphCalculator.generateSubPatterns && isomorph.similarIsomorphs.length > 0) {
					let similarTotal = 0;
					for (let similarPattern of isomorph.similarIsomorphs) {
						similarTotal += this.isomorphCalculator.isomorphs[similarPattern].instances.length;
					}
					labelText += "(" + similarTotal + ")";
				}

				const isomorphDisplay = createIsomorphDisplayElement(pattern, isomorph, labelText, () => this.selectIsomorph(pattern));
				this.isomorphListElement.appendChild(isomorphDisplay.element);
				this.isomorphDisplays[pattern] = isomorphDisplay;
			}
		}

		renderIsomorphDisplaysInfo(this.isomorphInfoElement, this.isomorphCalculator.isomorphs, this.sortedIsomorphs, true);
	}

	selectIsomorph(pattern) {
		if (!this.isActive) return;

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
			this.isomorphsSelectionPatternContainerElement.style.display = "none";
			this.isomorphsSelectionStatsElement.style.display = "none";
			return;
		}

		this.isomorphsSelectionListElement.innerHTML = "";
		this.isomorphsSelectionPatternContainerElement.style.display = "block";
		this.isomorphsSelectionPatternElement.innerText = this.selectedPattern;

		const selectedIsomorph = this.isomorphCalculator.isomorphs[this.selectedPattern];
		this.isomorphsSelectionStatsElement.style.display = "flex";
		this.isomorphsSelectionStatsElement.innerHTML = `
			<div>Length: ${this.selectedPattern.length}</div>
			<div>Repeats: ${selectedIsomorph.repeats}</div>
			<div>Instances: ${selectedIsomorph.instances.length}</div>
			<div>Score: ${selectedIsomorph.score.toFixed(2)}</div>
		`;

		for (let instance of this.isomorphCalculator.isomorphs[this.selectedPattern].instances) {
			const selectionMessageElement = document.createElement("div");
			selectionMessageElement.classList.toggle("selection-message");

			const selectionMessageIndicesElement = document.createElement("div");
			selectionMessageIndicesElement.classList.toggle("selection-message-indices");
			selectionMessageIndicesElement.innerHTML = `${instance[0]}:${instance[1] + 1}-${instance[1] + this.selectedPattern.length}`;

			selectionMessageElement.appendChild(selectionMessageIndicesElement);

			for (let i = 0; i < this.selectedPattern.length; i++) {
				const value = this.messageView.messagesParsed[instance[0]][instance[1] + i];

				let letterElement = document.createElement("div");
				letterElement.classList.toggle("selection-letter");
				letterElement.textContent = this.messageView.showASCII ? String.fromCharCode(value + 32) : value;

				let colours = getLetterColour(this.selectedPattern[i]);
				letterElement.style.backgroundColor = colours.bg;
				letterElement.style.color = colours.fg;

				selectionMessageElement.appendChild(letterElement);
			}

			selectionMessageElement.onclick = (e) => {
				e.preventDefault();
				const element = this.messageView.messageDisplays[instance[0]].letters[instance[1]];
				this.messageView.scrollTo(element);
			};

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
					letterElement.textContent = this.messageView.showASCII ? String.fromCharCode(value + 32) : value;

					if ((this.selectedPattern[i] == ".") != (similarPattern[i] == ".")) {
						letterElement.classList.add("warning");
					} else {
						let colours = getLetterColour(this.selectedPattern[i]);
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

class SharedPTView {
	constructor(messageView, isomorphCalculator) {
		this.configElement = document.getElementById("shared-pt-config");
		this.selectAllButtonElement = document.getElementById("shared-pt-config-select-all-button");
		this.deselectAllButtonElement = document.getElementById("shared-pt-config-deselect-all-button");
		this.showSeperatedInputElement = document.getElementById("shared-pt-config-input-show-seperated");
		this.mergeSequencesInputElement = document.getElementById("shared-pt-config-input-merge-sequences");

		this.viewElement = document.getElementById("shared-pt-view");
		this.listElement = document.getElementById("shared-pt-list");
		this.listInfoElement = document.getElementById("shared-pt-info");

		this.messageView = messageView;
		this.isomorphCalculator = isomorphCalculator;
		this.isomorphDisplays = {};
		this.selectedPatterns = {};
		this.sortedIsomorphs = [];
		this.isActive = false;
		this.showSeperated = this.showSeperatedInputElement.checked;
		this.mergeSequences = this.mergeSequencesInputElement.checked;

		this.selectAllButtonElement.onclick = () => this.selectAllIsomorphs();
		this.deselectAllButtonElement.onclick = () => this.deselectAllIsomorphs();
		this.showSeperatedInputElement.onchange = (e) => this.setShowSeperated(e.target.checked);
		this.mergeSequencesInputElement.onchange = (e) => this.setMergeSequences(e.target.checked);

		this.isomorphCalculator.onGenerateIsomorphListeners.push(() => this.reinitializeIsomorphs());

		this.messageView.onLetterClickListeners.push((messageIndex, letterIndex) => {
			if (!this.isActive) return;
			const position = this.messageView.setSelectedLetterPosition([messageIndex, letterIndex]);
			filterIsomorphDisplaysByPosition(this.isomorphDisplays, this.isomorphCalculator.isomorphs, position);
		});
	}

	reinitializeIsomorphs() {
		this.selectedPatterns = {};
		this.isomorphDisplays = {};

		if (Object.keys(this.isomorphCalculator.isomorphs).length == 0) {
			this.listElement.innerHTML = "<div class='empty'>No isomorphs...</div>";
		} else {
			this.sortedIsomorphs = Object.keys(this.isomorphCalculator.isomorphs).sort(
				(a, b) => this.isomorphCalculator.isomorphs[b].score - this.isomorphCalculator.isomorphs[a].score,
			);

			this.listElement.innerHTML = "";

			for (let pattern of this.sortedIsomorphs) {
				const isomorph = this.isomorphCalculator.isomorphs[pattern];
				const labelText = isomorph.instances.length.toString();
				const isomorphDisplay = createIsomorphDisplayElement(pattern, isomorph, labelText, () => this.selectIsomorph(pattern));
				this.listElement.appendChild(isomorphDisplay.element);
				this.isomorphDisplays[pattern] = isomorphDisplay;
			}
		}

		renderIsomorphDisplaysInfo(this.listInfoElement, this.isomorphCalculator.isomorphs, this.sortedIsomorphs, false);

		this.calculateAndHighlight();
	}

	selectIsomorph(pattern) {
		if (!this.isActive) return;

		if (this.selectedPatterns[pattern]) {
			this.isomorphDisplays[pattern].element.classList.remove("selected");
			delete this.selectedPatterns[pattern];
		} else {
			this.isomorphDisplays[pattern].element.classList.add("selected");
			this.selectedPatterns[pattern] = true;
		}
		this.calculateAndHighlight();
	}

	selectAllIsomorphs() {
		if (!this.isActive) return;

		for (let pattern in this.isomorphDisplays) {
			this.isomorphDisplays[pattern].element.classList.add("selected");
			this.selectedPatterns[pattern] = true;
		}
		this.calculateAndHighlight();
	}

	deselectAllIsomorphs() {
		if (!this.isActive) return;

		for (let pattern in this.isomorphDisplays) {
			this.isomorphDisplays[pattern].element.classList.remove("selected");
			delete this.selectedPatterns[pattern];
		}
		this.calculateAndHighlight();
	}

	setShowSeperated(showSeperated) {
		this.showSeperated = showSeperated;
		this.calculateAndHighlight();
	}

	setMergeSequences(mergeSequences) {
		this.mergeSequences = mergeSequences;
		this.calculateAndHighlight();
	}

	calculateAndHighlight() {
		if (!this.isActive) return;

		for (let pattern in this.isomorphDisplays) {
			this.isomorphDisplays[pattern].patternElement.style.backgroundColor = "";
		}

		this.messageView.highlightMessagesUniform(null);

		if (Object.keys(this.selectedPatterns).length == 0) return;

		if (this.showSeperated) {
			this.calculateAndHighlightSeperated();
		} else {
			this.calculateAndHighlightMerged();
		}
	}

	calculateAndHighlightSeperated() {
		const messages = this.messageView.messagesParsed;
		const sharedValues = messages.map((message) => message.map(() => []));

		for (let pattern in this.selectedPatterns) {
			const value = hashString(pattern);
			const colours = getIndexedColour(value);
			const [coreStart, coreEnd] = getCorePatternIndices(pattern);
			this.isomorphDisplays[pattern].patternElement.style.backgroundColor = colours.bg;

			for (let instance of this.isomorphCalculator.isomorphs[pattern].instances) {
				for (let i = 0; i < pattern.length; i++) {
					const isCore = i >= coreStart && i <= coreEnd;
					sharedValues[instance[0]][instance[1] + i].push({ isCore, value });
				}
			}
		}

		for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
			for (let letterIndex = 0; letterIndex < messages[messageIndex].length; letterIndex++) {
				const values = sharedValues[messageIndex][letterIndex];
				if (values.length == 0) continue;

				const element = this.messageView.messageDisplays[messageIndex].letters[letterIndex];
				if (values.length == 1) {
					element.style.background = getIndexedColour(values[0].value, !values[0].isCore).bg;
				} else {
					const step = 100 / values.length;
					const stops = values.map((data, index) => {
						const colour = getIndexedColour(data.value, !data.isCore).bg;
						return `${colour} ${index * step}% ${(index + 1) * step}%`;
					});
					element.style.background = `linear-gradient(0deg, ${stops.join(", ")})`;
				}
			}
		}
	}

	calculateAndHighlightMerged() {
		const messages = this.messageView.messagesParsed;
		let sharedData = messages.map((message) => message.map(() => new Set()));

		for (let pattern in this.selectedPatterns) {
			const value = hashString(pattern);
			const [coreStart, coreEnd] = getCorePatternIndices(pattern);
			for (let instance of this.isomorphCalculator.isomorphs[pattern].instances) {
				for (let i = coreStart; i <= coreEnd; i++) {
					sharedData[instance[0]][instance[1] + i].add(value);
				}
			}
		}

		let anyChanged = true;
		while (anyChanged) {
			anyChanged = false;
			for (let pattern in this.selectedPatterns) {
				const [coreStart, coreEnd] = getCorePatternIndices(pattern);
				for (let i = coreStart; i <= coreEnd; i++) {
					let columnValues = new Set();
					for (let instance of this.isomorphCalculator.isomorphs[pattern].instances) {
						columnValues = unionSets([columnValues, sharedData[instance[0]][instance[1] + i]]);
					}

					for (let instance of this.isomorphCalculator.isomorphs[pattern].instances) {
						const instanceValues = sharedData[instance[0]][instance[1] + i];
						if (!setsEqual(instanceValues, columnValues)) {
							sharedData[instance[0]][instance[1] + i] = new Set(columnValues);
							anyChanged = true;
						}
					}
				}
			}
		}

		let combinedValues = sharedData.map((row) => row.map((cell) => (cell.size == 0 ? null : hashInts(cell))));
		if (this.mergeSequences) {
			combinedValues = mergeAdjacentSequences(combinedValues);
		}

		for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
			for (let letterIndex = 0; letterIndex < messages[messageIndex].length; letterIndex++) {
				const value = combinedValues[messageIndex][letterIndex];
				if (value == null) continue;
				const element = this.messageView.messageDisplays[messageIndex].letters[letterIndex];
				element.style.background = getIndexedColour(value).bg;
			}
		}
	}

	setActive(isActive) {
		this.isActive = isActive;
		this.configElement.style.display = isActive ? "block" : "none";
		this.viewElement.style.display = isActive ? "flex" : "none";
		this.messageView.setClickableLetters(isActive);

		if (isActive) {
			this.calculateAndHighlight();
		} else {
			this.messageView.setSelectedLetterPosition(null);
			this.messageView.highlightMessagesUniform(null);
		}
	}
}

// -------------------- Driver --------------------

const messageView = new MessageView();
const isomorphCalculator = new IsomorphCalculator(messageView);
const isomorphView = new IsomorphView(messageView, isomorphCalculator);
const sharedPTView = new SharedPTView(messageView, isomorphCalculator);

const modeToggleButtonElements = {
	isomorphs: document.getElementById("toggle-mode-isomorphs-button"),
	sharedPT: document.getElementById("toggle-mode-shared-pt-button"),
};

function setActiveMode(mode) {
	isomorphView.setActive(mode == "isomorphs");
	sharedPTView.setActive(mode == "sharedPT");
	for (let key in modeToggleButtonElements) {
		modeToggleButtonElements[key].classList.toggle("active", key == mode);
	}
}

for (let key in modeToggleButtonElements) {
	modeToggleButtonElements[key].onclick = () => setActiveMode(key);
}

messageView.setMessageInput(EYE_MESSAGES_RAW);
setActiveMode("isomorphs");
