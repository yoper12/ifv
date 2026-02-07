class ElementBuilder<K extends keyof HTMLElementTagNameMap = "div"> {
    private element: HTMLElementTagNameMap[K];
    private lastConditionMet: boolean | undefined = undefined;

    constructor(tagName: K) {
        this.element = document.createElement(
            tagName,
        ) as HTMLElementTagNameMap[K];
    }

    /**
     * Creates an `ElementBuilder` instance from an existing DOM element. This allows you to use the builder methods to modify an existing element in a fluent style.
     *
     * @param element The existing DOM element from which to create the `ElementBuilder` instance.
     * @returns An instance of `ElementBuilder` for the specified element, allowing for method chaining to configure the element.
     *
     * @example
     * ```typescript
     * ElementBuilder
     *   .fromElement(document.getElementById("my-element"))
     *   .setStyles({ color: "blue" })
     *   .setTextContent("Updated text content");
     * ```
     */
    static fromElement(
        element: HTMLElement,
    ): ElementBuilder<keyof HTMLElementTagNameMap> {
        const tagName =
            element.tagName.toLowerCase() as keyof HTMLElementTagNameMap;
        const builder = new ElementBuilder(tagName);
        builder.element = element;
        return builder;
    }

    /**
     * Sets one or more attributes on the element.
     *
     * @param attributes An object where keys are attribute names and values are attribute values. Boolean `true` sets the attribute to an empty string (common for boolean attributes), `false` removes it.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("input")
     *  .setAttributes({ type: "text", disabled: true });
     * ```
     */
    setAttributes(attributes: Record<string, string | boolean>): this {
        for (const [key, value] of Object.entries(attributes)) {
            if (value === true) {
                this.element.setAttribute(key, "");
            } else if (value === false) {
                this.element.removeAttribute(key);
            } else {
                this.element.setAttribute(key, value);
            }
        }
        return this;
    }

    /**
     * Removes one or more attributes from the element.
     *
     * @param attributeNames One or more attribute names to be removed from the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("a")
     *  .removeAttributes("href", "target");
     * ```
     */
    removeAttributes(...attributeNames: string[]): this {
        for (const name of attributeNames) {
            this.element.removeAttribute(name);
        }
        return this;
    }

    /**
     * Sets the ID of the element.
     *
     * @param id The ID to be set on the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .setId("my-div");
     * ```
     */
    setId(id: string): this {
        this.element.id = id;
        return this;
    }

    /**
     * Sets one or more CSS styles on the element.
     *
     * @param styles An object where keys are CSS property names (in camelCase) and values are the corresponding CSS values to be set on the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .setStyles({ color: "red", fontSize: "16px" });
     * ```
     */
    setStyles(
        styles: Partial<Record<keyof CSSStyleDeclaration, string>>,
    ): this {
        Object.assign(this.element.style, styles);
        return this;
    }

    /**
     * Sets the text content of the element.
     *
     * @param text The text content to be set on the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("span")
     *   .setTextContent("Hello world");
     * ```
     */
    setTextContent(text: string): this {
        this.element.textContent = text;
        return this;
    }

    /**
     * Sets the inner HTML of the element. Remember that this method can lead to XSS if the HTML string contains untrusted content.
     *
     * @param html The HTML string to be set as the inner HTML of the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .setInnerHTML("<strong>Bold text</strong>");
     * ```
     */
    setInnerHTML(html: string): this {
        this.element.innerHTML = html;
        return this;
    }

    /**
     * Adds one or more class names to the element.
     *
     * @param classNames One or more class names to be added to the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .addClasses("class1", "class2");
     * ```
     */
    addClasses(...classNames: string[]): this {
        this.element.classList.add(...classNames);
        return this;
    }

    /**
     * Removes one or more class names from the element.
     *
     * @param classNames One or more class names to be removed from the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .removeClasses("class1", "class2");
     * ```
     */
    removeClasses(...classNames: string[]): this {
        this.element.classList.remove(...classNames);
        return this;
    }

    /**
     * Toggles a class name on the element. If the class is present, it will be removed; if it is not present, it will be added.
     *
     * @param className The class name to be toggled on the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .toggleClass("active");
     * ```
     */
    toggleClass(className: string): this {
        this.element.classList.toggle(className);
        return this;
    }

    /**
     * Sets one or more data attributes on the element.
     *
     * @param key The name of the data attribute (without the `data-` prefix).
     * @param value The value to be set for the data attribute.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .setData({ userId: "12345", sessionId: "abc", role: "admin" });
     * ```
     */
    setData(data: Record<string, string>): this {
        for (const [key, val] of Object.entries(data)) {
            this.element.dataset[key] = val;
        }
        return this;
    }

    /**
     * Removes one or more data attributes from the element.
     *
     * @param keys One or more names of data attributes (without the `data-` prefix) to be removed from the element.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .removeData("userId", "sessionId", "token");
     * ```
     */
    removeData(...keys: string[]): this {
        for (const key of keys) {
            delete this.element.dataset[key];
        }
        return this;
    }

    /**
     * Adds an event listener to the element.
     *
     * @param event The name of the event to listen for (e.g., "click", "mouseover").
     * @param listener The function to be called when the event is triggered. The `this` context of the listener will be the element itself.
     * @param options Optional options for the event listener (e.g., `{ signal: controller.signal }` to be able to remove the signal from `cleanup()` function).
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("button")
     *   .setTextContent("Click me")
     *   .on("click", () => {
     *     console.log("Button clicked! This is the button element:", this);
     *   });
     * ```
     */
    on<E extends keyof HTMLElementEventMap>(
        event: E,
        listener: (
            this: HTMLElementTagNameMap[K],
            ev: HTMLElementEventMap[E],
        ) => void,
        options?: AddEventListenerOptions,
    ): this {
        this.element.addEventListener(
            event,
            listener as EventListener,
            options,
        );
        return this;
    }

    /**
     * Appends one or more children elements to the current element.
     *
     * @param children One or more child elements to be appended. Each child can be either an `HTMLElement` or another `ElementBuilder` instance.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * const firstChild = createElement("span").setTextContent("First child");
     * const secondChild = createElement("div").setTextContent("Second child");
     *
     * createElement("div")
     *   .append(firstChild, secondChild);
     * ```
     */
    append(
        ...children: (
            | HTMLElement
            | ElementBuilder<keyof HTMLElementTagNameMap>
        )[]
    ): this {
        children.forEach((child) => {
            const element =
                child instanceof ElementBuilder ? child.getElement() : child;
            this.element.appendChild(element);
        });
        return this;
    }

    /**
     * Prepends one or more children elements to the current element (i.e., adds them before the existing children). First child in the arguments will be the first child of the element.
     *
     * @param children One or more child elements to be prepended. Each child can be either an `HTMLElement` or another `ElementBuilder` instance.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * const firstChild = createElement("span").setTextContent("First child");
     * const secondChild = createElement("div").setTextContent("Second child");
     *
     * createElement("div")
     *   .prepend(firstChild, secondChild);
     */
    prepend(
        ...children: (
            | HTMLElement
            | ElementBuilder<keyof HTMLElementTagNameMap>
        )[]
    ): this {
        children.reverse();
        children.forEach((child) => {
            const element =
                child instanceof ElementBuilder ? child.getElement() : child;
            this.element.prepend(element);
        });
        return this;
    }

    /**
     * Appends the current element to a parent element.
     *
     * @param parent The parent element to which the current element will be appended. Can be either an `HTMLElement` or another `ElementBuilder` instance.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * const parent = document.getElementById("parent");
     *
     * createElement("div")
     *   .setTextContent("Child element")
     *   .appendTo(parent);
     * ```
     */
    appendTo(
        parent: HTMLElement | ElementBuilder<keyof HTMLElementTagNameMap>,
    ): this {
        const parentElement =
            parent instanceof ElementBuilder ? parent.getElement() : parent;
        parentElement.appendChild(this.element);
        return this;
    }

    /**
     * Inserts the current element before a reference element.
     *
     * @param reference The reference element before which the current element will be inserted. Can be either an `HTMLElement` or another `ElementBuilder` instance. The reference element must have a parent node.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * const reference = document.getElementById("reference");
     *
     * createElement("div")
     *   .setTextContent("An element before the reference")
     *   .insertBefore(reference);
     * ```
     */
    insertBefore(reference: HTMLElement): this {
        reference.parentNode?.insertBefore(this.element, reference);
        return this;
    }

    /**
     * Inserts the current element after a reference element.
     *
     * @param reference The reference element after which the current element will be inserted. Can be either an `HTMLElement` or another `ElementBuilder` instance. The reference element must have a parent node.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * const reference = document.getElementById("reference");
     *
     * createElement("div")
     *   .setTextContent("An element after the reference")
     *   .insertAfter(reference);
     * ```
     */
    insertAfter(reference: HTMLElement): this {
        reference.parentNode?.insertBefore(this.element, reference.nextSibling);
        return this;
    }

    /**
     * Shows the element by setting its display style to an empty string (which defaults to the CSS or browser default). This won't work if the element is hidden by other CSS rules, in that case you should use `setStyles()` method to set the appropriate styles for showing the element.
     *
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .setTextContent("This is a div")
     *   .show();
     * ```
     */
    show(): this {
        this.element.style.display = "";
        return this;
    }

    /**
     * Hides the element by setting its display style to "none".
     *
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .setTextContent("This is a hidden div")
     *   .hide();
     * ```
     */
    hide(): this {
        this.element.style.display = "none";
        return this;
    }

    /**
     * Toggles the visibility of the element. If the element is currently hidden (i.e., its display style is "none"), it will be shown; if it is currently shown, it will be hidden.
     *
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * const div = createElement("div")
     *   .setTextContent("This is a div")
     *   .toggle();
     * ```
     */
    toggle(): this {
        if (this.element.style.display === "none") {
            this.show();
        } else {
            this.hide();
        }
        return this;
    }

    /**
     * Conditionally executes a callback function that receives the current `ElementBuilder` instance as an argument. This allows for applying certain configurations to the element only if a specific condition is met, enabling more dynamic and flexible element building.
     *
     * @param condition A boolean value that determines whether the callback function should be executed.
     * @param callback A function that takes the current `ElementBuilder` instance as an argument and applies additional configurations to it.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .setTextContent("This is a div")
     *   .if(condition1, (div) => div.setStyles({ color: "red" }));
     * ```
     */
    if(condition: boolean, callback: (element: this) => void): this {
        if (condition) {
            this.lastConditionMet = true;
            callback(this);
        } else {
            this.lastConditionMet = false;
        }
        return this;
    }

    /**
     * Conditionally executes a callback function if the previous `if`/`else-if` condition was not met and the current condition is true. Works in conjunction with `if()` and `else()` methods. You can use multiple `elseIf()` in a row to check multiple conditions.
     *
     * @param condition A boolean value that determines whether the callback function should be executed.
     * @param callback A function that takes the current `ElementBuilder` instance as an argument and applies additional configurations to it.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .if(condition1, (div) => div.setStyles({ color: "red" }))
     *   .elseIf(condition2, (div) => div.setStyles({ color: "green" }))
     * ```
     */
    elseIf(condition: boolean, callback: (element: this) => void): this {
        if (this.lastConditionMet === undefined)
            throw new Error("elseIf() cannot be used before or without if()");
        if (!this.lastConditionMet && condition) {
            this.lastConditionMet = true;
            callback(this);
        }
        return this;
    }

    /**
     * Conditionally executes a callback function if the previous `if`/`elseIf` conditions were not met. Works in conjunction with `if()` and `elseIf()` methods.
     *
     * @param callback A function that takes the current `ElementBuilder` instance as an argument and applies additional configurations to it.
     * @returns The current instance of `ElementBuilder` for method chaining.
     *
     * @example
     * ```typescript
     * createElement("div")
     *   .if(condition1, (div) => div.setStyles({ color: "red" }))
     *   .elseIf(condition2, (div) => div.setStyles({ color: "green" }))
     *   .else((div) => div.setStyles({ color: "blue" }));
     * ```
     */
    else(callback: (element: this) => void): this {
        if (this.lastConditionMet === undefined)
            throw new Error("else() cannot be used before or without if()");
        if (!this.lastConditionMet) {
            callback(this);
        }
        return this;
    }

    /**
     * Returns the underlying DOM element that has been built and configured using the `ElementBuilder` methods. This allows you to manipulate it further with standard DOM APIs.
     *
     * @returns The DOM element that has been built and configured.
     *
     * @example
     * ```typescript
     * const divElement = createElement("div")
     *   .setTextContent("This is a div")
     *   .getElement();
     */
    getElement(): HTMLElementTagNameMap[K] {
        return this.element;
    }
}

/**
 * Used for creating DOM elements in a fluent style. Provides methods for setting attributes, styles, text content, event listeners, and more. Can be used to build complex DOM structures in a readable and maintainable way.
 *
 * @param tagName The tag name of the element to create (e.g., "div", "span", "button").
 * @returns An instance of `ElementBuilder` for the specified tag name, allowing for method chaining to configure the element.
 *
 * @example
 * ```typescript
 * const div = createElement("div")
 *   .setId("my-div")
 *   .setStyles({ color: "red", fontSize: "16px" })
 *   .setTextContent("Hello, World!")
 *   .on("click", () => console.log("Div clicked!"))
 *   .appendTo(document.body)
 *   .getElement();
 * ```
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
): ElementBuilder<K> {
    return new ElementBuilder(tagName);
}
