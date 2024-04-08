import { Route, Router } from "@solidjs/router";
import Index from "./pages/Index";
import About from "./pages/About";

interface Props {
  root: any;
}

export default function (props: Props) {
  return (
    <Router root={props.root}>
      <Route path="/" component={Index}></Route>
      <Route path="/about" component={About}></Route>
    </Router>
  );
}
