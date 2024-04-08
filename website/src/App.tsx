import { A } from "@solidjs/router";
import { JSX } from "solid-js";

export default function (props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div>
      <div>
        <A href="/">Home</A> |<A href="/about">About</A>
      </div>
      {props.children}
    </div>
  );
}
