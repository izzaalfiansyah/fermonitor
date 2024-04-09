import { Route, Router } from "@solidjs/router";
import Index from "./pages/Index";
import Pengujian from "./pages/Pengujian";

interface Props {
  root: any;
}

export default function (props: Props) {
  return (
    <Router root={props.root}>
      <Route path="/" component={Index}></Route>
      <Route path="/pengujian" component={Pengujian}></Route>
    </Router>
  );
}
