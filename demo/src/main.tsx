import { render } from "preact";
import { App } from "./app.tsx";
import "mizu.css/light.css";

const parent = document.getElementById("app");
if (parent) render(<App />, parent);
