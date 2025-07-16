def get_levenshtein_distance_ratio(strA: str, strB: str) -> float:
    N = len(strA)
    M = len(strB)

    # Initialize a 2D array (list of lists) with zeros
    dp = [[0] * (M + 1) for _ in range(N + 1)]

    for i in range(N + 1):
        for j in range(M + 1):
            if i == 0:
                # Base case: If strA is empty, cost is to insert all characters of strB
                dp[i][j] = j
            elif j == 0:
                # Base case: If strB is empty, cost is to delete all characters of strA
                dp[i][j] = i
            else:
                # Calculate cost for substitution (0 if characters are same, 1 if different)
                substitution_cost = 0 if strA[i - 1] == strB[j - 1] else 1

                dp[i][j] = min(
                    dp[i][j - 1] + 1,  # Cost of insertion
                    dp[i - 1][j] + 1,  # Cost of deletion
                    dp[i - 1][j - 1] + substitution_cost,  # Cost of substitution
                )

    # Normalize the Levenshtein distance by the maximum length of the two strings
    max_len = max(N, M)
    if max_len == 0:  # Handle case where both strings are empty
        return 1.0

    invert_score = dp[N][M] / max_len

    # Calculate the similarity score as a ratio, handling floating-point precision
    score = (100 - (invert_score * 100)) / 100

    return score