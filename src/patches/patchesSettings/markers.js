/**
 * Zaznacza tekst w elemencie, który pasuje do podanego zapytania.
 *
 * @param {Node} element Element, w którym zaznaczamy tekst
 * @param {string} textQueryToHighlight String do wyszukania
 * @returns {void}
 */
export async function markTextInElement(element, textQueryToHighlight) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodesToModify = [];

    let currentNode;
    while ((currentNode = walker.nextNode())) {
        const nodeText = currentNode.nodeValue;
        const lowerNodeText = nodeText.toLowerCase();

        if (lowerNodeText.includes(textQueryToHighlight)) {
            nodesToModify.push({
                node: currentNode,
                query: textQueryToHighlight,
                text: nodeText,
            });
        }
    }

    for (const { node, query, text } of nodesToModify) {
        const lowerText = text.toLowerCase();
        let matchIndex = lowerText.indexOf(query);
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        while (matchIndex !== -1) {
            fragment.append(
                document.createTextNode(text.slice(lastIndex, matchIndex)),
            );
            const mark = document.createElement("mark");
            mark.textContent = text.slice(
                matchIndex,
                matchIndex + query.length,
            );
            fragment.append(mark);

            lastIndex = matchIndex + query.length;
            matchIndex = lowerText.indexOf(query, lastIndex);
        }
        fragment.append(
            document.createTextNode(text.slice(Math.max(0, lastIndex))),
        );

        node.parentNode.replaceChild(fragment, node);
    }

    element.normalize();
}

/**
 * Usuwa znaczniki <mark> z elementu
 *
 * @param {Node} element Element, z którego usuwamy znaczniki <mark>
 * @returns {void}
 */
export async function removeMarks(element) {
    const marks = element.querySelectorAll("mark");
    for (const mark of marks) {
        const parent = mark.parentNode;
        while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
        }
        mark.remove();
    }

    element.normalize();
}
