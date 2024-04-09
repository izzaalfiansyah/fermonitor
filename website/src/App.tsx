import { A } from "@solidjs/router";
import { JSX } from "solid-js";
import SettingIcon from "./icons/SettingIcon";

export default function (props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class="min-h-screen bg-gray-50">
      <div class="fixed top-0 left-0 bottom-0 z-20 bg-white w-72 lg:block hidden shadow h-screen"></div>
      <div class="lg:ml-72">
        <nav class="bg-white w-full flex items-center justify-between h-20 shadow-sm px-5">
          <div class="text-xl font-medium uppercase">Fermonitor</div>
          <A href="/setting">
            <SettingIcon class="w-7 h-7" />
          </A>
        </nav>
        <div class="p-5">
          <div>
            <A href="/">Home</A> |<A href="/about">About</A>
          </div>
          {props.children}
        </div>
      </div>
    </div>
  );
}
