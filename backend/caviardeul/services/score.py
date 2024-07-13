def compute_median_from_distribution(distribution: dict[str, int]) -> int:
    nb_winners = sum(distribution.values())
    index = nb_winners // 2
    median = 0
    categories = sorted([int(key) for key in distribution.keys()])
    for category in categories:
        index -= distribution[str(category)]
        if index <= 0:
            median = category * 10
            break
    return median
