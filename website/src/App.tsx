import { A, useLocation } from "@solidjs/router";
import { For, JSX } from "solid-js";
import SettingIcon from "./icons/SettingIcon";
import HomeIcon from "./icons/HomeIcon";
import ArchiveIcon from "./icons/ArchiveIcon";
import ClockIcon from "./icons/ClockIcon";

export default function (props: JSX.HTMLAttributes<HTMLDivElement>) {
  const location = useLocation();

  const menus = [
    {
      path: "/",
      title: "Dashboard",
      icon: HomeIcon,
    },
    {
      path: "/pengujian",
      title: "Pengujian",
      icon: ArchiveIcon,
    },
    {
      path: "/histori",
      title: "Histori",
      icon: ClockIcon,
    },
    {
      path: "/pengaturan",
      title: "Pengaturan",
      icon: SettingIcon,
    },
  ];

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col text-gray-700">
      <nav class="sticky top-0 left-0 right-0 z-20 bg-white w-full flex items-center justify-between h-[70px] shadow-sm px-5">
        <div class="text-xl font-medium uppercase">
          <span class="text-primary">Ferm</span>onitor
        </div>
        <A href="/pengaturan">
          <SettingIcon class="w-6 h-6" />
        </A>
      </nav>
      <div class="grow relative">
        <div class="absolute top-0 left-0 w-72 bg-white shadow-sm h-full px-8">
          <div class="mt-10">
            <For each={menus}>
              {(item) => (
                <A
                  href={item.path}
                  class={
                    "flex mb-3 items-center transition " +
                    (location.pathname == item.path ? "text-primary" : "")
                  }
                >
                  <item.icon class="w-5 h-5 mr-3"></item.icon>
                  {item.title}
                </A>
              )}
            </For>
          </div>
        </div>
        <div class="p-5 lg:ml-72">{props.children}</div>
      </div>
    </div>
  );
}
