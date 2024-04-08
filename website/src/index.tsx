/* @refresh reload */
import { render } from "solid-js/web";

import App from "./App";
import Router from "./Router";

const root = document.getElementById("root");

render(() => <Router root={App} />, root!);
