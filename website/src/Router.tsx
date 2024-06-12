import { HashRouter, Route } from "@solidjs/router";
import Index from "./pages/Index";
import Pengujian from "./pages/Pengujian";
import Histori from "./pages/Histori";
import Pengaturan from "./pages/Pengaturan";
import Kontrol from "./pages/Kontrol";

interface Props {
  root: any;
}

export default function (props: Props) {
  return (
    <HashRouter root={props.root}>
      <Route path="/" component={Index}></Route>
      <Route path="/pengujian" component={Pengujian}></Route>
      <Route path="/histori" component={Histori}></Route>
      <Route path="/kontrol" component={Kontrol}></Route>
      <Route path="/pengaturan" component={Pengaturan}></Route>
    </HashRouter>
  );
}
