/* @refresh reload */
import "@styles/index.css";
import { render } from "solid-js/web";
import App from "./app/App";

render(() => <App />, document.getElementById("root") as HTMLElement);
