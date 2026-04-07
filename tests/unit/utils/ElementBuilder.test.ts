import { builderFromElement, createElement } from "@/utils/ElementBuilder";

beforeEach(() => {
    document.body.innerHTML = "";
});

describe("attr", () => {
    it("should set multiple attributes on the element", () => {
        const element = createElement("input")
            .attr({ type: "text", placeholder: "enter text", disabled: true })
            .node();

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
            .attr({ type: "password", placeholder: "enter password", disabled: false })
            .node();

        expect(builder.getAttribute("type")).toBe("password");
        expect(builder.getAttribute("placeholder")).toBe("enter password");
        expect(builder.hasAttribute("disabled")).toBe(false);
    });
});

describe("rmAttr", () => {
    it("should remove specified attributes from the element", () => {
        const element = document.createElement("input");
        element.setAttribute("type", "text");
        element.setAttribute("disabled", "");

        const builder = builderFromElement(element).rmAttr("placeholder", "disabled").node();

        expect(builder.getAttribute("type")).toBe("text");
        expect(builder.hasAttribute("placeholder")).toBe(false);
        expect(builder.hasAttribute("disabled")).toBe(false);
    });
});

describe("id", () => {
    it("should set the id attribute on the element", () => {
        const element = createElement("div").id("my-div").node();

        expect(element.id).toBe("my-div");
    });

    it("should change the existing id attribute", () => {
        const element = document.createElement("div");
        element.id = "old-id";

        const builder = builderFromElement(element).id("new-id").node();

        expect(builder.id).toBe("new-id");
    });
});

describe("style", () => {
    it("should set multiple CSS styles on the element", () => {
        const element = createElement("div").style({ color: "red", backgroundColor: "blue" }).node();

        expect(element.style.color).toBe("red");
        expect(element.style.backgroundColor).toBe("blue");
    });

    it("should change existing CSS styles", () => {
        const element = document.createElement("div");
        element.style.color = "red";
        element.style.backgroundColor = "blue";

        const builder = builderFromElement(element)
            .style({ color: "green", backgroundColor: "yellow" })
            .node();

        expect(builder.style.color).toBe("green");
        expect(builder.style.backgroundColor).toBe("yellow");
    });
});

describe("text", () => {
    it("should set the text content of the element", () => {
        const element = createElement("p").text("hello, world!").node();

        expect(element.textContent).toBe("hello, world!");
    });

    it("should replace existing text content", () => {
        const element = document.createElement("p");
        element.textContent = "old text";

        const builder = builderFromElement(element).text("new text").node();

        expect(builder.textContent).toBe("new text");
    });
});

describe("html", () => {
    it("should set the inner HTML of the element", () => {
        const element = createElement("div").html("<span>hello</span> <strong>world</strong>").node();

        expect(element.innerHTML).toBe("<span>hello</span> <strong>world</strong>");
    });

    it("should replace existing inner HTML", () => {
        const element = document.createElement("div");
        element.innerHTML = "<p>old HTML</p>";

        const builder = builderFromElement(element).html("<h1>new HTML</h1>").node();

        expect(builder.innerHTML).toBe("<h1>new HTML</h1>");
    });
});

describe("class", () => {
    it("should add multiple classes to the element", () => {
        const element = createElement("div").class("class1", "class2").node();

        expect(element.classList.contains("class1")).toBe(true);
        expect(element.classList.contains("class2")).toBe(true);
    });
});

describe("rmClass", () => {
    it("should remove specified classes from the element", () => {
        const element = document.createElement("div");
        element.classList.add("class1", "class2", "class3");

        const builder = builderFromElement(element).rmClass("class2", "class3").node();

        expect(builder.classList.contains("class1")).toBe(true);
        expect(builder.classList.contains("class2")).toBe(false);
        expect(builder.classList.contains("class3")).toBe(false);
    });
});

describe("tgClass", () => {
    it("should toggle the specified class on the element", () => {
        const element = createElement("div").tgClass("active").node();

        expect(element.classList.contains("active")).toBe(true);

        builderFromElement(element).tgClass("active").node();

        expect(element.classList.contains("active")).toBe(false);
    });
});

describe("data", () => {
    it("should set multiple data attributes on the element", () => {
        const element = createElement("div").data({ userId: "123", role: "admin" }).node();

        expect(element.dataset.userId).toBe("123");
        expect(element.dataset.role).toBe("admin");
    });

    it("should change existing data attributes", () => {
        const element = document.createElement("div");
        element.dataset.userId = "123";
        element.dataset.role = "admin";

        const builder = builderFromElement(element).data({ userId: "456", role: "user" }).node();

        expect(builder.dataset.userId).toBe("456");
        expect(builder.dataset.role).toBe("user");
    });
});

describe("rmData", () => {
    it("should remove specified data attributes from the element", () => {
        const element = document.createElement("div");
        element.dataset.userId = "123";
        element.dataset.role = "admin";

        const builder = builderFromElement(element).rmData("userId").node();

        expect(builder.dataset.userId).toBeUndefined();
        expect(builder.dataset.role).toBe("admin");
    });
});

describe("on", () => {
    it("should add an event listener to the element", () => {
        const mockListener = vi.fn();
        const element = createElement("button").on("click", mockListener).node();

        element.click();

        expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it("should add an event listener with options", () => {
        const mockListener = vi.fn();
        const element = createElement("button").on("click", mockListener, { once: true }).node();

        element.click();
        element.click();

        expect(mockListener).toHaveBeenCalledTimes(1);
    });
});

describe("append", () => {
    it("should append child elements to the element", () => {
        const child1 = createElement("span").text("child 1");
        const child2 = createElement("span").text("child 2");

        const element = createElement("div").append(child1, child2).node();

        expect(element.children.length).toBe(2);
        expect(element.children[0].textContent).toBe("child 1");
        expect(element.children[1].textContent).toBe("child 2");
    });
});

describe("prepend", () => {
    it("should prepend child elements to the element", () => {
        const child1 = createElement("span").text("child 1");
        const child2 = createElement("span").text("child 2");

        const element = createElement("div").prepend(child1).node();

        expect(element.children.length).toBe(1);

        builderFromElement(element).prepend(child2).node();

        expect(element.children.length).toBe(2);
        expect(element.children[0].textContent).toBe("child 2");
        expect(element.children[1].textContent).toBe("child 1");
    });
});

describe("appendTo", () => {
    it("should append the element to the specified parent", () => {
        const parent = document.createElement("div");
        const child = createElement("span").appendTo(parent).node();

        expect(parent.children.length).toBe(1);
        expect(parent.children[0]).toBe(child);
    });
});

describe("insertBefore", () => {
    it("should insert the element before the specified reference element", () => {
        const parent = document.createElement("div");
        const reference = document.createElement("span");
        parent.appendChild(reference);
        const element = createElement("strong").insertBefore(reference).node();

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
        const element = createElement("strong").insertAfter(reference).node();

        expect(parent.children.length).toBe(2);
        expect(parent.children[0]).toBe(reference);
        expect(parent.children[1]).toBe(element);
    });
});

describe("show", () => {
    it("should show the element by setting display to an empty string", () => {
        const element = createElement("div").hide().show().node();

        expect(element.style.display).toBe("");
    });
});

describe("hide", () => {
    it("should hide the element by setting display to 'none'", () => {
        const element = createElement("div").hide().node();

        expect(element.style.display).toBe("none");
    });
});

describe("toggle", () => {
    it("should toggle the visibility of the element", () => {
        const element = createElement("div").toggle().node();

        expect(element.style.display).toBe("none");

        builderFromElement(element).toggle();

        expect(element.style.display).toBe("");
    });
});

describe("remove", () => {
    it("should remove the element from the DOM", () => {
        const parent = document.createElement("div");
        const element = createElement("span").appendTo(parent).node();

        expect(parent.children.length).toBe(1);

        builderFromElement(element).remove();

        expect(parent.children.length).toBe(0);
    });
});

describe("if, elseIf, else", () => {
    it("should execute if callback if the first condition is true", () => {
        const element = createElement("div")
            .if(true, (el) => el.text("condition 1 met"))
            .else((el) => el.text("no conditions met"))
            .node();

        expect(element.textContent).toBe("condition 1 met");
    });

    it("should execute the elseIf callback if the first condition is false and the second condition is true", () => {
        const element = createElement("div")
            .if(false, (el) => el.text("condition 1 met"))
            .elseIf(true, (el) => el.text("condition 2 met"))
            .else((el) => el.text("no conditions met"))
            .node();

        expect(element.textContent).toBe("condition 2 met");
    });

    it("should execute the else callback if all conditions are false", () => {
        const element = createElement("div")
            .if(false, (el) => el.text("condition 1 met"))
            .elseIf(false, (el) => el.text("condition 2 met"))
            .else((el) => el.text("no conditions met"))
            .node();

        expect(element.textContent).toBe("no conditions met");
    });

    it("should execute nested conditional callbacks correctly", () => {
        const element = createElement("div")
            .if(true, (el) =>
                el
                    .if(false, (nestedEl) => nestedEl.text("nested condition met"))
                    .else((nestedEl) => nestedEl.text("nested condition not met")),
            )
            .else((el) => el.text("outer condition not met"))
            .node();

        expect(element.textContent).toBe("nested condition not met");

        builderFromElement(element)
            .if(false, (el) =>
                el
                    .if(true, (nestedEl) => nestedEl.text("nested condition met"))
                    .else((nestedEl) => nestedEl.text("nested condition not met")),
            )
            .else((el) => el.text("outer condition not met"))
            .node();

        expect(element.textContent).toBe("outer condition not met");

        builderFromElement(element)
            .if(false, (el) =>
                el
                    .if(true, (nestedEl) => nestedEl.text("nested condition met"))
                    .else((nestedEl) => nestedEl.text("nested condition not met")),
            )
            .elseIf(true, (el) =>
                el
                    .if(true, (nestedEl) => nestedEl.text("second nested condition met"))
                    .else((nestedEl) => nestedEl.text("second nested condition not met")),
            )
            .else((el) => el.text("outer condition not met"))
            .node();

        expect(element.textContent).toBe("second nested condition met");
    });
});
