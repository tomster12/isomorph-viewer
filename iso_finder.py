# CODE PRODUCED BY @lymm37 and @toboter ON DISCORD
# MODIFIED BY ME FOR USE

from itertools import combinations, product
import math
import time


def calculate_sub_patterns(pattern, max_symbols_removed):
    # Extract some basic information about the pattern
    symbols = set(pattern)
    symbols.remove(".")
    symbol_inner_indices = {symbol: [] for symbol in symbols}
    symbol_counts = {symbol: 0 for symbol in symbols}
    for i in range(len(pattern)):
        if pattern[i] != ".":
            if i > 0 and i < len(pattern) - 1:
                symbol_inner_indices[pattern[i]].append(i)
            symbol_counts[pattern[i]] += 1

    # Find all combinations of removable repeats for each symbol
    symbol_remove_combos = {symbol: [] for symbol in symbols}
    for symbol in symbols:
        symbol_remove_combos[symbol].append(())
        for remove_count in range(1, len(symbol_inner_indices[symbol]) + 1):
            if symbol_counts[symbol] - remove_count != 1:
                for combo in combinations(symbol_inner_indices[symbol], remove_count):
                    symbol_remove_combos[symbol].append(combo)

    # Find all combinations of symbol removal combinations
    symbol_remove_combos_flat = [
        symbol_remove_combos[symbol] for symbol in symbols]
    sub_patterns = []
    for multisymbol_remove_combo in product(*symbol_remove_combos_flat):
        symbol_difference = sum([len(combo)
                                for combo in multisymbol_remove_combo])
        if symbol_difference <= max_symbols_removed:

            # Produce the pattern with the symbols removed
            raw_sub_pattern = list(pattern)
            for i in range(len(symbols)):
                indices = multisymbol_remove_combo[i]
                for index in indices:
                    raw_sub_pattern[index] = "."
            raw_sub_pattern = "".join(raw_sub_pattern)

            # Remap symbols to be clean
            remap = {".": "."}
            i = 0
            final_sub_pattern = []
            for symbol in raw_sub_pattern:
                if symbol not in remap:
                    remap[symbol] = chr(97 + i)
                    i += 1
                final_sub_pattern.append(remap[symbol])
            sub_patterns.append("".join(final_sub_pattern))

    return sub_patterns


def pattern_from_sequence(sequence):
    letter_mapping = {}
    letter_counts = {}
    for letter in sequence:
        letter_counts[letter] = letter_counts.get(letter, 0) + 1

    for letter in sequence:
        if letter_counts[letter] > 1 and letter not in letter_mapping:
            letter_mapping[letter] = chr(65 + len(letter_mapping))

    pattern = ""
    for letter in sequence:
        pattern += letter_mapping.get(letter, ".")

    return pattern


def find_isomorphs(messages, max_length=30):
    """
    Extracts all patterns from messages, regardless of how many times they occur. You can filter this as needed afterward.
    :param messages: List of lists of symbols.
    :param max_length: Longest isomorph pattern to search for, default 30.
    :returns: Dictionary where the keys are pattern strings (like A.B.CB.AC) and values are lists of (message index, position) tuples.
    """
    isomorphs = {}

    # Find all patterns with repeats from each possible sequence in each message
    for pattern_length in range(2, max_length + 1):
        for msg_index in range(len(messages)):
            for i in range(len(messages[msg_index]) - pattern_length + 1):
                sequence = messages[msg_index][i: i + pattern_length]

                # Early check that the sequence encapsulates some repeats by checking either:
                # - The sequence start and end values are equal
                # - The sequence start and end values are included in the inner sequence
                inner_sequence = sequence[1:-1]
                if (sequence[0] != sequence[-1]) and ((sequence[0] not in inner_sequence) or (sequence[-1] not in inner_sequence)):
                    continue

                # Get pattern from sequence and track this instance of it
                pattern = pattern_from_sequence(sequence)

                if pattern not in isomorphs.keys():
                    isomorphs[pattern] = []

                if sequence[0] != sequence[-1]:
                    print(pattern)

                isomorphs[pattern].append((msg_index, i))

    return isomorphs


def isomorph_score(messages, isomorphs, alphabet_size, use_binomial=False, to_print=False):
    ct_length = sum([len(message) for message in messages])
    message_count = len(messages)

    iso_scores = {}
    for isomorph, isomorph_positions in isomorphs.items():
        isomorph_length = len(isomorph)
        isomorph_instances = len(isomorph_positions)

        # Exclude isomorphs with only 1 instance
        if isomorph_instances == 1:
            continue

        isomorph_letters_used = set()
        internal_repeat_count = 0
        for letter in isomorph:
            if letter == '.':
                continue
            if letter not in isomorph_letters_used:
                isomorph_letters_used.add(letter)
            else:
                internal_repeat_count += 1

        # Exclude isomorphs with 1 letter repeated once
        if internal_repeat_count == 1:
            continue

        # Each internal repeat is probability (1 / alphabet_size)
        # For now we'll keep it invariant of the length of the isomorph
        # Each isomorph repeat is probability (1 / (alphabet_size)^(internal_repeat_count + isomorph_letters_used))
        # Here you want to count the first occurrence of each letter because it's also 1/alphabet size.
        # Of course the probability depends on the length of the text too...
        # Consider a text of length N to have each letter randomly uniformly distributed over the alphabet
        # Overlapping allowed for now.
        # For an isomorph of length M, there are effectively N - M + 1 trials
        # Each trial is a length M subsequence of the random text
        # We let the first character A be whatever, but need to count the other ones that match it.
        # Additionally, if a separate character B repeats, we don't count the first occurrence of it,
        # Because it could be any letter and still be a valid isomorph (well, other than A...?)
        # But here, we'll still count AAA as an occurrence of the ABA isomorph. (AAA gets a higher score anyway)
        # So the probability of an isomorph occurring once is (1 / (alphabet_size)^(internal_repeat_count))
        # Consider the binomial probability given occurrences and number of trials?
        # Note that this ignores how far apart they are, and lets them overlap
        # (n choose k) iso_score**isomorph_count * (1 - iso_score)^(trials - isomorph_count)

        iso_probability = 1 / alphabet_size**internal_repeat_count
        iso_score = -math.log(iso_probability) / math.log(10)
        # group_iso_probability = iso_probability**isomorph_count
        group_iso_score = iso_score * isomorph_instances

        if use_binomial:
            trials = ct_length - message_count * (isomorph_length - 1)
            group_iso_score -= math.log(1 - iso_probability) / \
                math.log(10) * (trials - isomorph_instances)
            group_iso_score -= math.log(math.comb(trials,
                                        isomorph_instances))/math.log(10)

        if to_print:
            print(f"{isomorph} repeats {isomorph_instances} times, with {
                internal_repeat_count} internal repeats")
            print(f"Probability {iso_probability} per event")
            print(f"Isomorph score {iso_score} for one, or {
                group_iso_score} for the group\n")

        iso_scores[isomorph] = group_iso_score

    return iso_scores


eye_messages = [
    [50, 66, 5, 48, 62, 13, 75, 29, 24, 61, 42, 70, 66, 62, 32, 14, 81, 8, 15, 78, 2, 29, 13, 49, 1, 80, 82, 40, 63, 81, 21, 19, 0, 40, 51, 65, 26, 14, 21, 70, 47, 44, 48, 42, 19, 48, 13, 47, 19, 49,
        72, 31, 5, 24, 3, 43, 59, 67, 33, 49, 41, 60, 21, 26, 30, 5, 25, 20, 71, 11, 74, 56, 4, 74, 19, 71, 4, 51, 41, 43, 80, 72, 54, 63, 79, 81, 15, 16, 44, 31, 30, 12, 33, 57, 28, 13, 64, 43, 48],
    [80, 66, 5, 48, 62, 13, 75, 29, 24, 61, 42, 70, 66, 62, 32, 14, 81, 8, 15, 78, 2, 29, 13, 49, 1, 29, 11, 30, 52, 81, 21, 19, 0, 25, 26, 54, 20, 14, 21, 70, 47, 44, 48, 42, 19, 48, 13, 47, 19, 49, 44, 26,
        59, 77, 64, 43, 79, 28, 72, 64, 1, 30, 73, 23, 67, 6, 33, 25, 64, 81, 68, 46, 17, 36, 13, 17, 21, 68, 13, 9, 46, 67, 57, 34, 62, 82, 15, 10, 73, 62, 2, 11, 65, 72, 37, 44, 10, 43, 68, 62, 9, 34, 18],
    [36, 66, 5, 48, 62, 13, 75, 29, 24, 61, 42, 70, 66, 62, 32, 14, 81, 8, 15, 78, 2, 29, 13, 49, 1, 69, 76, 52, 9, 48, 66, 80, 22, 64, 57, 40, 49, 78, 3, 16, 56, 19, 47, 40, 80, 6, 13, 64, 29, 49, 64, 63, 6, 49, 31, 13, 16, 10, 45,
        24, 26, 77, 10, 60, 81, 61, 34, 54, 70, 21, 15, 4, 66, 77, 42, 37, 30, 22, 0, 11, 41, 72, 57, 20, 23, 57, 65, 41, 23, 18, 72, 42, 5, 3, 26, 78, 8, 5, 54, 45, 77, 25, 64, 61, 16, 44, 54, 51, 20, 63, 25, 11, 26, 45, 53, 60, 38, 34],
    [76, 66, 5, 49, 75, 54, 69, 46, 32, 1, 42, 60, 26, 48, 50, 80, 32, 24, 55, 61, 47, 12, 21, 12, 49, 54, 34, 25, 36, 15, 56, 55, 20, 9, 8, 62, 13, 82, 9, 44, 29, 60, 53, 82, 42, 80, 5, 43, 71, 3, 80, 77,
        47, 78, 34, 25, 62, 18, 10, 49, 62, 64, 52, 81, 11, 66, 62, 13, 47, 17, 52, 70, 26, 23, 32, 31, 64, 23, 35, 32, 50, 6, 1, 25, 8, 37, 47, 43, 26, 76, 65, 68, 80, 17, 7, 45, 63, 14, 53, 63, 60, 16],
    [63, 66, 5, 49, 75, 54, 2, 60, 29, 40, 78, 47, 60, 75, 67, 71, 60, 2, 65, 7, 47, 14, 45, 74, 59, 41, 80, 13, 60, 13, 81, 22, 35, 50, 40, 39, 2, 59, 48, 31, 76, 2, 80, 75, 1, 56, 67, 11, 21, 8, 40, 65, 45, 75, 55, 39, 60, 42, 13, 3, 22, 57, 2, 6, 58, 9, 70, 1, 58,
        56, 63, 68, 25, 79, 7, 20, 19, 64, 2, 66, 73, 30, 71, 16, 12, 30, 65, 37, 20, 13, 22, 63, 18, 46, 64, 59, 41, 81, 82, 22, 78, 36, 47, 17, 4, 6, 17, 5, 36, 79, 63, 1, 64, 69, 15, 43, 4, 58, 56, 31, 14, 64, 58, 18, 44, 78, 69, 1, 0, 46, 20, 71, 73, 25, 35, 8, 24],
    [34, 66, 5, 49, 75, 54, 23, 74, 11, 13, 28, 26, 19, 48, 67, 57, 37, 60, 34, 28, 74, 10, 17, 32, 11, 18, 19, 43, 19, 81, 42, 4, 62, 9, 46, 49, 32, 51, 76, 58, 4, 43, 47, 17, 67, 79, 21, 32, 44, 16, 30, 37, 26, 28, 41, 68, 57, 34, 51, 10, 69, 70,
        8, 6, 46, 43, 18, 39, 47, 43, 15, 13, 33, 30, 35, 62, 37, 0, 37, 5, 38, 55, 37, 13, 40, 25, 9, 21, 11, 64, 5, 79, 42, 68, 11, 71, 11, 48, 3, 67, 61, 40, 22, 14, 35, 50, 61, 39, 11, 2, 66, 49, 51, 53, 17, 73, 36, 75, 74, 54, 24, 30, 54, 70],
    [27, 66, 5, 49, 75, 54, 2, 60, 29, 40, 2, 55, 9, 15, 59, 18, 68, 3, 36, 5, 47, 77, 44, 38, 1, 18, 28, 76, 4, 34, 60, 63, 58, 80, 17, 54, 79, 75, 48, 54, 55, 19, 62, 64, 14, 47, 51, 70, 75, 5, 11, 47, 45, 58, 68, 69, 79, 25, 38, 45,
        73, 47, 68, 50, 34, 45, 78, 26, 79, 57, 4, 56, 22, 60, 18, 75, 43, 60, 59, 67, 63, 42, 49, 33, 40, 65, 79, 77, 7, 3, 26, 62, 31, 78, 26, 57, 69, 40, 4, 23, 26, 13, 67, 42, 38, 72, 11, 39, 65, 60, 25, 6, 80, 66, 68, 77, 59, 78, 19],
    [77, 66, 5, 49, 75, 54, 2, 60, 29, 40, 2, 55, 9, 15, 59, 18, 68, 3, 36, 5, 47, 60, 21, 80, 1, 72, 55, 16, 82, 35, 57, 19, 1, 66, 18, 27, 39, 17, 74, 81, 39, 14, 78, 0, 25, 65, 43, 66, 64, 38, 81, 23, 24, 50, 57, 30, 71, 75, 26, 68, 54,
        57, 56, 50, 71, 73, 14, 21, 8, 32, 26, 63, 5, 37, 19, 43, 66, 47, 53, 34, 66, 23, 73, 31, 54, 38, 77, 67, 11, 63, 79, 6, 22, 21, 51, 69, 74, 21, 5, 17, 67, 37, 29, 21, 60, 14, 82, 44, 30, 4, 20, 42, 35, 1, 31, 54, 46, 20, 40, 30],
    [33, 66, 5, 49, 75, 54, 2, 60, 29, 40, 2, 55, 9, 15, 59, 18, 68, 3, 36, 5, 47, 33, 21, 59, 44, 18, 28, 76, 59, 34, 60, 63, 79, 27, 12, 54, 5, 49, 48, 54, 55, 52, 62, 72, 69, 10, 57, 22, 58, 48, 67, 53, 7, 34, 32, 30, 31,
        19, 26, 8, 34, 46, 7, 30, 71, 55, 34, 75, 54, 9, 6, 60, 5, 23, 25, 45, 42, 80, 25, 12, 22, 76, 20, 51, 62, 21, 40, 9, 41, 10, 44, 73, 8, 33, 70, 73, 6, 31, 21, 72, 5, 40, 61, 51, 42, 66, 64, 74, 61, 25, 63, 42, 24, 41]
]

if __name__ == "__main__":
    eye_messages = [[chr(i + 32) for i in eye_message]
                    for eye_message in eye_messages]

    start_time = time.time()
    isomorphs = find_isomorphs(
        eye_messages, max_length=41)
    end_time = time.time()

    # More than one instance
    # More than one repeated trigram
    # Atleast 2 of the sequences are different
    isomorphs_filtered = {}
    for isomorph in isomorphs:
        if len(isomorphs[isomorph]) > 1:
            if len(isomorph.replace('.', '')) > 2:
                if len(set([''.join(eye_messages[msg][pos: pos + len(isomorph)])
                            for msg, pos in isomorphs[isomorph]])) > 1:
                    isomorphs_filtered[isomorph] = isomorphs[isomorph]

    isomorph_scores = isomorph_score(
        eye_messages, isomorphs_filtered, 83, use_binomial=False, to_print=False)

    # Sort isomorphs_filtered by isomorph_score descending
    isomorphs_filtered = dict(
        sorted(isomorphs_filtered.items(), key=lambda x: isomorph_scores[x[0]], reverse=True))

    # Print out usable data
    # for k, v in isomorphs_filtered.items():
    #     instances = "[" + ', '.join([f"[{x[0]},{x[1]}]" for x in v]) + "]"
    #     print(
    #         f'"{k}": {{"score": {isomorph_scores[k]}, "instances": {instances}}},')
