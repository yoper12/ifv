export class ElementBuilder<K extends keyof HTMLElementTagNameMap> {
    _element: HTMLElementTagNameMap[K];
    #lastConditionMet: boolean | undefined = undefined;

    constructor(tagName: K) {
        this._element = document.createElement(tagName);
    }

    /**
     * Sets one or more attributes on the element.
     *
     * @example
     *
     * ```typescript
     * createElement("input").setAttributes({ type: "text", disabled: true });
     * ```
     *
     * @param attributes An object where keys are attribute names and values are attribute values. Boolean
     *   `true` sets the attribute to an empty string (for boolean attributes), `false` removes it.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    setAttributes(attributes: Record<string, string | boolean>): this {
        for (const [key, value] of Object.entries(attributes)) {
            if (value === true) {
                this._element.setAttribute(key, "");
            } else if (value === false) {
                this._element.removeAttribute(key);
            } else {
                this._element.setAttribute(key, value);
            }
        }
        return this;
    }

    /**
     * Removes one or more attributes from the element.
     *
     * @example
     *
     * ```typescript
     * createElement("a").removeAttributes("href", "target");
     * ```
     *
     * @param attributeNames One or more attribute names to be removed from the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    removeAttributes(...attributeNames: string[]): this {
        for (const name of attributeNames) {
            this._element.removeAttribute(name);
        }
        return this;
    }

    /**
     * Sets the ID of the element.
     *
     * @example
     *
     * ```typescript
     * createElement("div").setId("my-div");
     * ```
     *
     * @param id The ID to be set on the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    setId(id: string): this {
        this._element.id = id;
        return this;
    }

    /**
     * Sets one or more CSS styles on the element.
     *
     * @example
     *
     * ```typescript
     * createElement("div").setStyles({ color: "red", fontSize: "16px" });
     * ```
     *
     * @param styles An object where keys are CSS property names (in camelCase) and values are the
     *   corresponding CSS values to be set on the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    setStyles(styles: Partial<Record<keyof CSSStyleDeclaration, string>>): this {
        Object.assign(this._element.style, styles);
        return this;
    }

    /**
     * Sets the text content of the element.
     *
     * @example
     *
     * ```typescript
     * createElement("span").setTextContent("Hello world");
     * ```
     *
     * @param text The text content to be set on the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    setTextContent(text: string): this {
        this._element.textContent = text;
        return this;
    }

    /**
     * Sets the inner HTML of the element. This method tries to use the new `setHTML` API which prevents XSS
     * vulnerabilities by sanitizing the HTML string from unsafe elements. It can however fall back to
     * `innerHTML` if `setHTML` is not supported in the current environment and thus you should ensure that
     * the HTML string is safe to use and won't cause XSS vulnerabilities.
     *
     * @example
     *
     * ```typescript
     * createElement("div").setHTML("<strong>Bold text</strong>");
     * ```
     *
     * @param html The HTML string to be set as the inner HTML of the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML|Check on MDN}
     */
    setHTML(html: string): this {
        // @ts-expect-error - setHTML is not yet included in lib.dom.d.ts
        if (this._element.setHTML) {
            // @ts-expect-error - setHTML is not yet included in lib.dom.d.ts
            this._element.setHTML(html);
        } else {
            this._element.innerHTML = html;
        }
        return this;
    }

    /**
     * Adds one or more class names to the element.
     *
     * @example
     *
     * ```typescript
     * createElement("div").addClasses("class1", "class2");
     * ```
     *
     * @param classNames One or more class names to be added to the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    addClasses(...classNames: string[]): this {
        this._element.classList.add(...classNames);
        return this;
    }

    /**
     * Removes one or more class names from the element.
     *
     * @example
     *
     * ```typescript
     * createElement("div").removeClasses("class1", "class2");
     * ```
     *
     * @param classNames One or more class names to be removed from the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    removeClasses(...classNames: string[]): this {
        this._element.classList.remove(...classNames);
        return this;
    }

    /**
     * Toggles a class name on the element. If the class is present, it will be removed; if it is not
     * present, it will be added.
     *
     * @example
     *
     * ```typescript
     * createElement("div").toggleClass("active");
     * ```
     *
     * @param className The class name to be toggled on the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    toggleClass(className: string): this {
        this._element.classList.toggle(className);
        return this;
    }

    /**
     * Sets one or more data attributes on the element.
     *
     * @example
     *
     * ```typescript
     * createElement("div").setData({ userId: "12345", sessionId: "abc", role: "admin" });
     * ```
     *
     * @param key The name of the data attribute (without the `data-` prefix).
     * @param value The value to be set for the data attribute.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    setData(data: Record<string, string>): this {
        for (const [key, val] of Object.entries(data)) {
            this._element.dataset[key] = val;
        }
        return this;
    }

    /**
     * Removes one or more data attributes from the element.
     *
     * @example
     *
     * ```typescript
     * createElement("div").removeData("userId", "sessionId", "token");
     * ```
     *
     * @param keys One or more names of data attributes (without the `data-` prefix) to be removed from the
     *   element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    removeData(...keys: string[]): this {
        for (const key of keys) {
            delete this._element.dataset[key];
        }
        return this;
    }

    /**
     * Adds an event listener to the element.
     *
     * @example
     *
     * ```typescript
     * createElement("button")
     *     .setTextContent("Click me")
     *     .on("click", () => {
     *         console.log("Button clicked! This is the button element:", this);
     *     });
     * ```
     *
     * @param event The name of the event to listen for (e.g., "click", "mouseover").
     * @param listener The function to be called when the event is triggered. The `this` context of the
     *   listener will be the element itself.
     * @param options Optional options for the event listener (e.g., `{ signal: controller.signal }` to be
     *   able to remove the listener from `cleanup()` function).
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    on<E extends keyof HTMLElementEventMap>(
        event: E,
        listener: (this: HTMLElementTagNameMap[K], ev: HTMLElementEventMap[E]) => void,
        options?: AddEventListenerOptions,
    ): this {
        this._element.addEventListener(event, listener as EventListener, options);
        return this;
    }

    /**
     * Appends one or more children elements to the current element.
     *
     * @example
     *
     * ```typescript
     * const firstChild = createElement("span").setTextContent("First child");
     * const secondChild = createElement("div").setTextContent("Second child");
     *
     * createElement("div").append(firstChild, secondChild);
     * ```
     *
     * @param children One or more child elements to be appended. Each child can be either an `HTMLElement`
     *   or another `ElementBuilder` instance.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    append(...children: (HTMLElement | ElementBuilder<keyof HTMLElementTagNameMap>)[]): this {
        children.forEach((child) => {
            const _element = child instanceof ElementBuilder ? child.getElement() : child;
            this._element.appendChild(_element);
        });
        return this;
    }

    /**
     * Prepends one or more children elements to the current element (i.e., adds them before the existing
     * children). First child in the arguments will be the first child of the element.
     *
     * @example
     *
     * ```typescript
     * const firstChild = createElement("span").setTextContent("First child");
     * const secondChild = createElement("div").setTextContent("Second child");
     *
     * createElement("div").prepend(firstChild, secondChild);
     * ```
     *
     * @param children One or more child elements to be prepended. Each child can be either an `HTMLElement`
     *   or another `ElementBuilder` instance.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    prepend(...children: (HTMLElement | ElementBuilder<keyof HTMLElementTagNameMap>)[]): this {
        children.reverse();
        children.forEach((child) => {
            const _element = child instanceof ElementBuilder ? child.getElement() : child;
            this._element.prepend(_element);
        });
        return this;
    }

    /**
     * Appends the current element to a parent element.
     *
     * @example
     *
     * ```typescript
     * const parent = document.querySelector("#parent");
     *
     * createElement("div").setTextContent("Child element").appendTo(parent);
     * ```
     *
     * @param parent The parent element to which the current element will be appended. Can be either an
     *   `HTMLElement` or another `ElementBuilder` instance.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    appendTo(parent: HTMLElement | ElementBuilder<keyof HTMLElementTagNameMap>): this {
        const parentElement = parent instanceof ElementBuilder ? parent.getElement() : parent;
        parentElement.appendChild(this._element);
        return this;
    }

    /**
     * Inserts the current element before a reference element.
     *
     * @example
     *
     * ```typescript
     * const reference = document.querySelector("#reference");
     *
     * createElement("div").setTextContent("An element before the reference").insertBefore(reference);
     * ```
     *
     * @param reference The reference element before which the current element will be inserted. Can be
     *   either an `HTMLElement` or another `ElementBuilder` instance. The reference element must have a
     *   parent node.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    insertBefore(reference: HTMLElement | ElementBuilder<keyof HTMLElementTagNameMap>): this {
        const refElement = reference instanceof ElementBuilder ? reference.getElement() : reference;
        refElement.parentNode?.insertBefore(this._element, refElement);
        return this;
    }

    /**
     * Inserts the current element after a reference element.
     *
     * @example
     *
     * ```typescript
     * const reference = document.querySelector("#reference");
     *
     * createElement("div").setTextContent("An element after the reference").insertAfter(reference);
     * ```
     *
     * @param reference The reference element after which the current element will be inserted. Can be either
     *   an `HTMLElement` or another `ElementBuilder` instance. The reference element must have a parent
     *   node.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    insertAfter(reference: HTMLElement | ElementBuilder<keyof HTMLElementTagNameMap>): this {
        const refElement = reference instanceof ElementBuilder ? reference.getElement() : reference;
        refElement.parentNode?.insertBefore(this._element, refElement.nextSibling);
        return this;
    }

    /**
     * Shows the element by setting its display style to an empty string (which defaults to the CSS or
     * browser default). This won't work if the element is hidden by other CSS rules, in that case you should
     * use `setStyles()` method to set the appropriate styles for showing the element.
     *
     * @example
     *
     * ```typescript
     * createElement("div").setTextContent("This is a div").show();
     * ```
     *
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    show(): this {
        this._element.style.display = "";
        return this;
    }

    /**
     * Hides the element by setting its display style to "none".
     *
     * @example
     *
     * ```typescript
     * createElement("div").setTextContent("This is a hidden div").hide();
     * ```
     *
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    hide(): this {
        this._element.style.display = "none";
        return this;
    }

    /**
     * Toggles the visibility of the element. If the element is currently hidden (i.e., its display style is
     * "none"), it will be shown; if it is currently shown, it will be hidden.
     *
     * @example
     *
     * ```typescript
     * const div = createElement("div").setTextContent("This is a div").toggle();
     * ```
     *
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    toggle(): this {
        if (this._element.style.display === "none") {
            this.show();
        } else {
            this.hide();
        }
        return this;
    }

    /**
     * Removes the element from the DOM.
     *
     * @example
     *
     * ```typescript
     * createElement("div").setTextContent("This div will be removed").remove();
     * ```
     *
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    remove(): this {
        this._element.remove();
        return this;
    }

    /**
     * Conditionally executes a callback function that receives the current `ElementBuilder` instance as an
     * argument. This allows for applying certain configurations to the element only if a specific condition
     * is met, enabling more dynamic and flexible element building.
     *
     * @example
     *
     * ```typescript
     * createElement("div")
     *     .setTextContent("This is a div")
     *     .if(condition1, (div) => div.setStyles({ color: "red" }));
     * ```
     *
     * @param condition A boolean value that determines whether the callback function should be executed.
     * @param callback A function that takes the current `ElementBuilder` instance as an argument and applies
     *   additional configurations to it.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    if(condition: boolean, callback: (_element: this) => void): this {
        this.#lastConditionMet = condition;

        if (condition) {
            const previousState = this.#lastConditionMet;
            callback(this);
            this.#lastConditionMet = previousState;
        }

        return this;
    }

    /**
     * Conditionally executes a callback function if the previous `if`/`else-if` condition was not met and
     * the current condition is true. Works in conjunction with `if()` and `else()` methods. You can use
     * multiple `elseIf()` in a row to check multiple conditions.
     *
     * @example
     *
     * ```typescript
     * createElement("div")
     *     .if(condition1, (div) => div.setStyles({ color: "red" }))
     *     .elseIf(condition2, (div) => div.setStyles({ color: "green" }));
     * ```
     *
     * @param condition A boolean value that determines whether the callback function should be executed.
     * @param callback A function that takes the current `ElementBuilder` instance as an argument and applies
     *   additional configurations to it.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    elseIf(condition: boolean, callback: (_element: this) => void): this {
        if (this.#lastConditionMet === undefined)
            throw new Error("elseIf() cannot be used before or without if()");

        if (!this.#lastConditionMet && condition) {
            callback(this);

            this.#lastConditionMet = true;
        }

        return this;
    }

    /**
     * Conditionally executes a callback function if the previous `if`/`elseIf` conditions were not met.
     * Works in conjunction with `if()` and `elseIf()` methods.
     *
     * @example
     *
     * ```typescript
     * createElement("div")
     *     .if(condition1, (div) => div.setStyles({ color: "red" }))
     *     .elseIf(condition2, (div) => div.setStyles({ color: "green" }))
     *     .else((div) => div.setStyles({ color: "blue" }));
     * ```
     *
     * @param callback A function that takes the current `ElementBuilder` instance as an argument and applies
     *   additional configurations to it.
     * @returns The current instance of `ElementBuilder` for method chaining.
     */
    else(callback: (_element: this) => void): this {
        if (this.#lastConditionMet === undefined)
            throw new Error("else() cannot be used before or without if()");

        if (!this.#lastConditionMet) {
            callback(this);
        }

        this.#lastConditionMet = undefined;
        return this;
    }

    /**
     * Returns the underlying DOM element that has been built and configured using the `ElementBuilder`
     * methods. This allows you to manipulate it further with standard DOM APIs.
     *
     * @example
     *
     * ```typescript
     * const divElement = createElement("div").setTextContent("This is a div").getElement();
     * ```
     *
     * @returns The DOM element that has been built and configured.
     */
    getElement(): HTMLElementTagNameMap[K] {
        return this._element;
    }
}

/**
 * Used for creating DOM elements in a fluent style. Provides methods for setting attributes, styles, text
 * content, event listeners, and more. Can be used to build complex DOM structures in a readable and
 * maintainable way.
 *
 * @example
 *
 * ```typescript
 * const div = createElement("div")
 *     .setId("my-div")
 *     .setStyles({ color: "red", fontSize: "16px" })
 *     .setTextContent("Hello, World!")
 *     .on("click", () => console.log("Div clicked!"))
 *     .appendTo(document.body)
 *     .getElement();
 * ```
 *
 * @param tagName The tag name of the element to create (e.g., "div", "span", "button").
 * @returns An instance of `ElementBuilder` for the specified tag name, allowing for method chaining to
 *   configure the element.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): ElementBuilder<K> {
    return new ElementBuilder(tagName);
}

/**
 * Creates an `ElementBuilder` instance from an existing DOM element. This allows you to use the builder
 * methods to modify an existing element in a fluent style.
 *
 * @example
 *
 * ```typescript
 * ElementBuilder.fromElement(document.querySelector("#my-element"))
 *     .setStyles({ color: "blue" })
 *     .setTextContent("Updated text content");
 * ```
 *
 * @param element The existing DOM element from which to create the `ElementBuilder` instance.
 * @returns An instance of `ElementBuilder` for the specified element, allowing for method chaining to
 *   configure the element.
 */
export function builderFromElement<K extends keyof HTMLElementTagNameMap>(
    element: HTMLElementTagNameMap[K],
): ElementBuilder<K> {
    const tagName = element.tagName.toLowerCase() as K;
    const builder = new ElementBuilder(tagName);
    builder._element = element;
    return builder;
}
