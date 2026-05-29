/**
 * SM-2 Spaced Repetition Algorithm
 * quality: 0-5
 *   0-2 = wrong / forgot (again)
 *   3   = hard (correct but difficult)
 *   4   = good (correct, normal effort)
 *   5   = easy (correct, no effort)
 */
export function sm2Update(card, quality) {
    let { easeFactor = 2.5, interval = 1, repetitions = 0 } = card

    if (quality >= 3) {
        if (repetitions === 0)      interval = 1
        else if (repetitions === 1) interval = 6
        else                        interval = Math.round(interval * easeFactor)
        repetitions++
    } else {
        repetitions = 0
        interval    = 1
    }

    easeFactor = Math.max(
        1.3,
        easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    )

    const nextReviewDate = new Date(Date.now() + interval * 86_400_000)

    return { easeFactor, interval, repetitions, nextReviewDate }
}

/** Default SRS card state for a new card */
export function newSrsCard(cardId) {
    return {
        cardId,
        easeFactor:     2.5,
        interval:       1,
        repetitions:    0,
        lapses:         0,
        totalReviews:   0,
        nextReviewDate: new Date(),      // due immediately on first encounter
        lastReviewDate: null,
    }
}
