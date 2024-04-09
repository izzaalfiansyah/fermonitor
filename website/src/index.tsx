/* @refresh reload */
import { render } from "solid-js/web";

import App from "./App";
import Router from "./Router";

import "./index.css";

const root = document.getElementById("root");

render(() => <Router root={App} />, root!);
