import { builderFromElement, createElement } from "@/utils/ElementBuilder";

beforeEach(() => {
    document.body.innerHTML = "";
});

describe("setAttributes", () => {
    it("should set multiple attributes on the element", () => {
        const element = createElement("input")
            .setAttributes({ type: "text", placeholder: "enter text", disabled: true })
            .getElement();

        expect(element.getAttribute("type")).toBe("text");
        expect(element.getAttribute("placeholder")).toBe("enter text");
        expect(element.hasAttribute("disabled")).toBe(true);
    });

    it("should change existing attributes", () => {
        const element = document.createElement("input");
        element.setAttribute("type", "text");
        element.setAttribute("placeholder", "enter text");
        element.setAttribute("disabled", "");

        const builder = builderFromElement(element)
            .setAttributes({ type: "password", placeholder: "enter password", disabled: false })
            .getElement();

        expect(builder.getAttribute("type")).toBe("password");
        expect(builder.getAttribute("placeholder")).toBe("enter password");
        expect(builder.hasAttribute("disabled")).toBe(false);
    });
});

describe("removeAttributes", () => {
    it("should remove specified attributes from the element", () => {
        const element = document.createElement("input");
        element.setAttribute("type", "text");
        element.setAttribute("disabled", "");

        const builder = builderFromElement(element).removeAttributes("placeholder", "disabled").getElement();

        expect(builder.getAttribute("type")).toBe("text");
        expect(builder.hasAttribute("placeholder")).toBe(false);
        expect(builder.hasAttribute("disabled")).toBe(false);
    });
});

describe("setId", () => {
    it("should set the id attribute on the element", () => {
        const element = createElement("div").setId("my-div").getElement();

        expect(element.id).toBe("my-div");
    });

    it("should change the existing id attribute", () => {
        const element = document.createElement("div");
        element.id = "old-id";

        const builder = builderFromElement(element).setId("new-id").getElement();

        expect(builder.id).toBe("new-id");
    });
});

describe("setStyles", () => {
    it("should set multiple CSS styles on the element", () => {
        const element = createElement("div")
            .setStyles({ color: "red", backgroundColor: "blue" })
            .getElement();

        expect(element.style.color).toBe("red");
        expect(element.style.backgroundColor).toBe("blue");
    });

    it("should change existing CSS styles", () => {
        const element = document.createElement("div");
        element.style.color = "red";
        element.style.backgroundColor = "blue";

        const builder = builderFromElement(element)
            .setStyles({ color: "green", backgroundColor: "yellow" })
            .getElement();

        expect(builder.style.color).toBe("green");
        expect(builder.style.backgroundColor).toBe("yellow");
    });
});

describe("setTextContent", () => {
    it("should set the text content of the element", () => {
        const element = createElement("p").setTextContent("hello, world!").getElement();

        expect(element.textContent).toBe("hello, world!");
    });

    it("should replace existing text content", () => {
        const element = document.createElement("p");
        element.textContent = "old text";

        const builder = builderFromElement(element).setTextContent("new text").getElement();

        expect(builder.textContent).toBe("new text");
    });
});

describe("setHTML", () => {
    it("should set the inner HTML of the element", () => {
        const element = createElement("div")
            .setHTML("<span>hello</span> <strong>world</strong>")
            .getElement();

        expect(element.innerHTML).toBe("<span>hello</span> <strong>world</strong>");
    });

    it("should replace existing inner HTML", () => {
        const element = document.createElement("div");
        element.innerHTML = "<p>old HTML</p>";

        const builder = builderFromElement(element).setHTML("<h1>new HTML</h1>").getElement();

        expect(builder.innerHTML).toBe("<h1>new HTML</h1>");
    });
});

describe("addClasses", () => {
    it("should add multiple classes to the element", () => {
        const element = createElement("div").addClasses("class1", "class2").getElement();

        expect(element.classList.contains("class1")).toBe(true);
        expect(element.classList.contains("class2")).toBe(true);
    });
});

describe("removeClasses", () => {
    it("should remove specified classes from the element", () => {
        const element = document.createElement("div");
        element.classList.add("class1", "class2", "class3");

        const builder = builderFromElement(element).removeClasses("class2", "class3").getElement();

        expect(builder.classList.contains("class1")).toBe(true);
        expect(builder.classList.contains("class2")).toBe(false);
        expect(builder.classList.contains("class3")).toBe(false);
    });
});

describe("toggleClass", () => {
    it("should toggle the specified class on the element", () => {
        const element = createElement("div").toggleClass("active").getElement();

        expect(element.classList.contains("active")).toBe(true);

        builderFromElement(element).toggleClass("active").getElement();

        expect(element.classList.contains("active")).toBe(false);
    });
});

describe("setData", () => {
    it("should set multiple data attributes on the element", () => {
        const element = createElement("div").setData({ userId: "123", role: "admin" }).getElement();

        expect(element.dataset.userId).toBe("123");
        expect(element.dataset.role).toBe("admin");
    });

    it("should change existing data attributes", () => {
        const element = document.createElement("div");
        element.dataset.userId = "123";
        element.dataset.role = "admin";

        const builder = builderFromElement(element).setData({ userId: "456", role: "user" }).getElement();

        expect(builder.dataset.userId).toBe("456");
        expect(builder.dataset.role).toBe("user");
    });
});

describe("removeData", () => {
    it("should remove specified data attributes from the element", () => {
        const element = document.createElement("div");
        element.dataset.userId = "123";
        element.dataset.role = "admin";

        const builder = builderFromElement(element).removeData("userId").getElement();

        expect(builder.dataset.userId).toBeUndefined();
        expect(builder.dataset.role).toBe("admin");
    });
});

describe("on", () => {
    it("should add an event listener to the element", () => {
        const mockListener = vi.fn();
        const element = createElement("button").on("click", mockListener).getElement();

        element.click();

        expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it("should add an event listener with options", () => {
        const mockListener = vi.fn();
        const element = createElement("button").on("click", mockListener, { once: true }).getElement();

        element.click();
        element.click();

        expect(mockListener).toHaveBeenCalledTimes(1);
    });
});

describe("append", () => {
    it("should append child elements to the element", () => {
        const child1 = createElement("span").setTextContent("child 1");
        const child2 = createElement("span").setTextContent("child 2");

        const element = createElement("div").append(child1, child2).getElement();

        expect(element.children.length).toBe(2);
        expect(element.children[0].textContent).toBe("child 1");
        expect(element.children[1].textContent).toBe("child 2");
    });
});

describe("prepend", () => {
    it("should prepend child elements to the element", () => {
        const child1 = createElement("span").setTextContent("child 1");
        const child2 = createElement("span").setTextContent("child 2");

        const element = createElement("div").prepend(child1).getElement();

        expect(element.children.length).toBe(1);

        builderFromElement(element).prepend(child2).getElement();

        expect(element.children.length).toBe(2);
        expect(element.children[0].textContent).toBe("child 2");
        expect(element.children[1].textContent).toBe("child 1");
    });
});

describe("appendTo", () => {
    it("should append the element to the specified parent", () => {
        const parent = document.createElement("div");
        const child = createElement("span").appendTo(parent).getElement();

        expect(parent.children.length).toBe(1);
        expect(parent.children[0]).toBe(child);
    });
});

describe("insertBefore", () => {
    it("should insert the element before the specified reference element", () => {
        const parent = document.createElement("div");
        const reference = document.createElement("span");
        parent.appendChild(reference);
        const element = createElement("strong").insertBefore(reference).getElement();

        expect(parent.children.length).toBe(2);
        expect(parent.children[0]).toBe(element);
        expect(parent.children[1]).toBe(reference);
    });
});

describe("insertAfter", () => {
    it("should insert the element after the specified reference element", () => {
        const parent = document.createElement("div");
        const reference = document.createElement("span");
        parent.appendChild(reference);
        const element = createElement("strong").insertAfter(reference).getElement();

        expect(parent.children.length).toBe(2);
        expect(parent.children[0]).toBe(reference);
        expect(parent.children[1]).toBe(element);
    });
});

describe("show", () => {
    it("should show the element by setting display to an empty string", () => {
        const element = createElement("div").hide().show().getElement();

        expect(element.style.display).toBe("");
    });
});

describe("hide", () => {
    it("should hide the element by setting display to 'none'", () => {
        const element = createElement("div").hide().getElement();

        expect(element.style.display).toBe("none");
    });
});

describe("toggle", () => {
    it("should toggle the visibility of the element", () => {
        const element = createElement("div").toggle().getElement();

        expect(element.style.display).toBe("none");

        builderFromElement(element).toggle();

        expect(element.style.display).toBe("");
    });
});

describe("remove", () => {
    it("should remove the element from the DOM", () => {
        const parent = document.createElement("div");
        const element = createElement("span").appendTo(parent).getElement();

        expect(parent.children.length).toBe(1);

        builderFromElement(element).remove();

        expect(parent.children.length).toBe(0);
    });
});

describe("if, elseIf, else", () => {
    it("should execute if callback if the first condition is true", () => {
        const element = createElement("div")
            .if(true, (el) => el.setTextContent("condition 1 met"))
            .else((el) => el.setTextContent("no conditions met"))
            .getElement();

        expect(element.textContent).toBe("condition 1 met");
    });

    it("should execute the elseIf callback if the first condition is false and the second condition is true", () => {
        const element = createElement("div")
            .if(false, (el) => el.setTextContent("condition 1 met"))
            .elseIf(true, (el) => el.setTextContent("condition 2 met"))
            .else((el) => el.setTextContent("no conditions met"))
            .getElement();

        expect(element.textContent).toBe("condition 2 met");
    });

    it("should execute the else callback if all conditions are false", () => {
        const element = createElement("div")
            .if(false, (el) => el.setTextContent("condition 1 met"))
            .elseIf(false, (el) => el.setTextContent("condition 2 met"))
            .else((el) => el.setTextContent("no conditions met"))
            .getElement();

        expect(element.textContent).toBe("no conditions met");
    });

    it("should execute nested conditional callbacks correctly", () => {
        const element = createElement("div")
            .if(true, (el) =>
                el
                    .if(false, (nestedEl) => nestedEl.setTextContent("nested condition met"))
                    .else((nestedEl) => nestedEl.setTextContent("nested condition not met")),
            )
            .else((el) => el.setTextContent("outer condition not met"))
            .getElement();

        expect(element.textContent).toBe("nested condition not met");

        builderFromElement(element)
            .if(false, (el) =>
                el
                    .if(true, (nestedEl) => nestedEl.setTextContent("nested condition met"))
                    .else((nestedEl) => nestedEl.setTextContent("nested condition not met")),
            )
            .else((el) => el.setTextContent("outer condition not met"))
            .getElement();

        expect(element.textContent).toBe("outer condition not met");

        builderFromElement(element)
            .if(false, (el) =>
                el
                    .if(true, (nestedEl) => nestedEl.setTextContent("nested condition met"))
                    .else((nestedEl) => nestedEl.setTextContent("nested condition not met")),
            )
            .elseIf(true, (el) =>
                el
                    .if(true, (nestedEl) => nestedEl.setTextContent("second nested condition met"))
                    .else((nestedEl) => nestedEl.setTextContent("second nested condition not met")),
            )
            .else((el) => el.setTextContent("outer condition not met"))
            .getElement();

        expect(element.textContent).toBe("second nested condition met");
    });
});
