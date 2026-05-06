import { mount } from "svelte";

import Popup from "./components/Popup.svelte";

const app = mount(Popup, { target: document.querySelector("#app")! });

export default app;
