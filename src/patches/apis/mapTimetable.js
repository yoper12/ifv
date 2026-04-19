const groupRegex = / Grupa-| \|/;

export const mapDay = (element) =>
    Array.from(
        element.querySelectorAll(".cell--single, .cell--multi--conflicted"),
        normalizeLesson,
    );
function normalizeLesson(lesson) {
    const hoursText = (
        lesson.querySelector(
            ".position__lesson__hours, .conflicted--details--hours",
        )?.textContent || "  "
    ).split(" ");
    const startingHour = hoursText[0];
    const endingHour = hoursText[2];

    const subjectText =
        lesson
            .querySelector(".position__lesson__subject")
            ?.textContent?.split(groupRegex) || [];

    const annotationText = lesson.querySelector(
        ".plan-position__adnotation-title",
    )?.textContent;

    const type =
        lesson.classList.contains("cell--multi--conflicted") ? "conflicted"
        : lesson.querySelector(".zastepstwo") ? "substitute"
        : lesson.querySelector(".odwolane") ? "canceled"
        : annotationText ? "unknown"
        : "normal";

    return {
        annotationText,
        classroom: [
            ...(lesson.querySelector(".position__lesson__subject + span")
                ?.textContent || ""),
        ]
            .filter((c) => !"()".includes(c))
            .join("")
            .trim(),
        endingHour,
        group: subjectText[1],
        originalElement: lesson,
        startingHour,
        subject: subjectText[0],
        teacher: lesson.querySelector(".position__lesson__teacher")
            ?.textContent,
        type,
    };
}
