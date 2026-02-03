import { getSetting } from "./apis/settings.js";

function modifyGradesRequests() {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function () {
        this._requestMethod = arguments[0];
        this._requestURL = arguments[1];
        return originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        if (this._requestURL && this._requestURL.includes("/api/Oceny?")) {
            const originalOnReadyStateChange = this.onreadystatechange;

            this.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    try {
                        let data = JSON.parse(this.responseText);
                        const originalResponse = JSON.parse(this.responseText);

                        console.debug(
                            "Oryginalna odpowiedź:",
                            originalResponse,
                        );

                        if (
                            data &&
                            data.ocenyPrzedmioty &&
                            Array.isArray(data.ocenyPrzedmioty) &&
                            !data.ustawienia.isSredniaAndPunkty
                        ) {
                            data.ocenyPrzedmioty.forEach((subject) => {
                                let sum = 0;
                                let totalWeight = 0;

                                if (
                                    subject.kolumnyOcenyCzastkowe &&
                                    Array.isArray(subject.kolumnyOcenyCzastkowe)
                                ) {
                                    subject.kolumnyOcenyCzastkowe.forEach(
                                        (column) => {
                                            if (
                                                column.oceny &&
                                                Array.isArray(column.oceny)
                                            ) {
                                                column.oceny.forEach(
                                                    (grade) => {
                                                        if (
                                                            grade.wpis &&
                                                            grade.wpis.match(
                                                                /^[0-6](\+|-)?$/,
                                                            )
                                                        ) {
                                                            let value =
                                                                parseFloat(
                                                                    grade.wpis,
                                                                );
                                                            if (
                                                                grade.wpis.includes(
                                                                    "+",
                                                                )
                                                            )
                                                                value +=
                                                                    getSetting(
                                                                        "Count averages",
                                                                        "plusValue",
                                                                    );
                                                            else if (
                                                                grade.wpis.includes(
                                                                    "-",
                                                                )
                                                            )
                                                                value -=
                                                                    getSetting(
                                                                        "Count averages",
                                                                        "minusValue",
                                                                    );

                                                            sum +=
                                                                value *
                                                                grade.waga;
                                                            totalWeight +=
                                                                grade.waga;
                                                        }
                                                    },
                                                );
                                            }
                                        },
                                    );
                                }

                                if (totalWeight > 0) {
                                    subject.srednia = (
                                        sum / totalWeight
                                    ).toFixed(2);
                                }
                            });

                            if (data.ustawienia) {
                                data.ustawienia.isSredniaAndPunkty = true;
                            }

                            console.debug("Zmodyfikowana odpowiedź:", data);
                        }

                        Object.defineProperty(this, "responseText", {
                            get: function () {
                                return data;
                            },
                        });

                        Object.defineProperty(this, "response", {
                            get: function () {
                                return data;
                            },
                        });
                    } catch (e) {
                        console.debug("Błąd modyfikacji odpowiedzi:", e);
                    }
                }

                if (typeof originalOnReadyStateChange === "function") {
                    originalOnReadyStateChange.apply(this, arguments);
                }
            };
        }

        return originalXHRSend.apply(this, arguments);
    };
}

window.appendModule({
    run: modifyGradesRequests,
    onlyOnReloads: true,
});
