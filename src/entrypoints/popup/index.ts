import Popup from "./components/Popup.svelte";
import { mount } from "svelte";

const app = mount(Popup, { target: document.querySelector("#app")! });

export default app;
