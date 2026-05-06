import { getSetting } from "./apis/settings.js";

const gradeRegex = /^[0-6](?:\+|-)?$/;

function modifyGradesRequests() {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function () {
        this._requestMethod = arguments[0];
        this._requestURL = arguments[1];
        return Reflect.apply(originalXHROpen, this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        if (this._requestURL && this._requestURL.includes("/api/Oceny?")) {
            const originalOnReadyStateChange = this.onreadystatechange;

            this.addEventListener("readystatechange", function () {
                if (this.readyState === 4 && this.status === 200) {
                    try {
                        let data = JSON.parse(this.responseText);
                        const originalResponse = JSON.parse(this.responseText);

                        console.debug(
                            "Oryginalna odpowiedź:",
                            originalResponse,
                        );

                        if (
                            data
                            && data.ocenyPrzedmioty
                            && Array.isArray(data.ocenyPrzedmioty)
                            && !data.ustawienia.isSredniaAndPunkty
                        ) {
                            for (const subject of data.ocenyPrzedmioty) {
                                let sum = 0;
                                let totalWeight = 0;

                                if (
                                    subject.kolumnyOcenyCzastkowe
                                    && Array.isArray(
                                        subject.kolumnyOcenyCzastkowe,
                                    )
                                ) {
                                    for (const column of subject.kolumnyOcenyCzastkowe) {
                                        if (
                                            column.oceny
                                            && Array.isArray(column.oceny)
                                        ) {
                                            for (const grade of column.oceny) {
                                                if (
                                                    grade.wpis
                                                    && gradeRegex.test(
                                                        grade.wpis,
                                                    )
                                                ) {
                                                    let value =
                                                        Number.parseFloat(
                                                            grade.wpis,
                                                        );
                                                    if (
                                                        grade.wpis.includes("+")
                                                    )
                                                        value += getSetting(
                                                            "Count averages",
                                                            "plusValue",
                                                        );
                                                    else if (
                                                        grade.wpis.includes("-")
                                                    )
                                                        value -= getSetting(
                                                            "Count averages",
                                                            "minusValue",
                                                        );

                                                    sum += value * grade.waga;
                                                    totalWeight += grade.waga;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (totalWeight > 0) {
                                    subject.srednia = (
                                        sum / totalWeight
                                    ).toFixed(2);
                                }
                            }

                            if (data.ustawienia) {
                                data.ustawienia.isSredniaAndPunkty = true;
                            }

                            console.debug("Zmodyfikowana odpowiedź:", data);
                        }

                        Object.defineProperty(this, "responseText", {
                            get: () => data,
                        });

                        Object.defineProperty(this, "response", {
                            get: () => data,
                        });
                    } catch (error) {
                        console.debug("Błąd modyfikacji odpowiedzi:", error);
                    }
                }

                if (typeof originalOnReadyStateChange === "function") {
                    Reflect.apply(originalOnReadyStateChange, this, arguments);
                }
            });
        }

        return Reflect.apply(originalXHRSend, this, arguments);
    };
}

globalThis.appendModule({ onlyOnReloads: true, run: modifyGradesRequests });
