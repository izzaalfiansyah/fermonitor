import { A, useLocation, useNavigate } from "@solidjs/router";
import { createSignal, For, JSX, Match, onMount, Show, Switch } from "solid-js";
import SettingIcon from "./icons/SettingIcon";
import HomeIcon from "./icons/HomeIcon";
import ArchiveIcon from "./icons/ArchiveIcon";
import ClockIcon from "./icons/ClockIcon";
import supabase from "./utils/supabase";
import { Histori } from "./types/Histori";
import { Pengaturan } from "./types/Pengaturan";
import BarsIcon from "./icons/BarsIcon";
import AdjusmentIcon from "./icons/AdjusmentIcon";
import BellAlert from "./icons/BellAlert";

export default function (props: JSX.HTMLAttributes<HTMLDivElement>) {
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
      path: "/kontrol",
      title: "Kontrol",
      icon: AdjusmentIcon,
    },
    {
      path: "/pengaturan",
      title: "Pengaturan",
      icon: SettingIcon,
    },
  ];

  const [lastHistori, setLastHistori] = createSignal<Histori | null>(null);
  const [canNavigate, setCanNavigate] = createSignal<boolean>(false);
  const [showSidebar, setShowSidebar] = createSignal<boolean>(false);
  const [pengaturan, setPengaturan] = createSignal<Pengaturan>();

  const location = useLocation();
  const navigate = useNavigate();

  const getLastHistori = async () => {
    const { data } = await supabase
      .from("histori_fermentasi")
      .select("*")
      .limit(1)
      .order("created_at", { ascending: false });

    if (!!data) {
      setLastHistori(data[0]);
    }
  };

  const fermentasiSelesai = async () => {
    const isOk = confirm(
      "Sistem akan melakukan reset untuk memulai proses fermentasi baru! Lanjutkan?"
    );

    if (isOk) {
      await supabase.from("pengaturan").update({ running: false }).eq("id", 1);
      await supabase.from("kondisi_tapai").delete().neq("id", "0");
      await supabase
        .from("realtime_data")
        .update({
          kadar_gas: 0,
          kelembaban: 0,
          suhu: 0,
          created_time: 0,
        })
        .eq("id", 1);

      window.location.reload();
    }
  };

  const saveHistori = async () => {
    const auto = pengaturan()?.auto;
    const suhu_min = pengaturan()?.suhu_min;
    const suhu_max = pengaturan()?.suhu_max;

    const rentang_suhu = auto ? suhu_min + " - " + suhu_max : "-";

    await supabase
      .from("histori_fermentasi")
      .update({
        selesai: true,
        rentang_suhu,
      })
      .eq("id", lastHistori()?.id);

    await getLastHistori();
  };

  // const noSaveHistori = async () => {
  //   await supabase
  //     .from("histori_fermentasi")
  //     .delete()
  //     .eq("id", lastHistori()?.id);
  // };

  const checkStatusDevice = async () => {
    if (pengaturan()?.running) {
      const lastData1: any = await new Promise(async (res) => {
        const { data } = await supabase
          .from("realtime_data")
          .select("created_time")
          .eq("id", 1);
        setTimeout(() => {
          res(data);
        }, 10000);
      });

      const { data: lastData2 } = await supabase
        .from("realtime_data")
        .select("created_time")
        .eq("id", 1);

      // const lastData1: any = await new Promise(async (res) => {
      //   const { data } = await supabase
      //     .from("kondisi_tapai")
      //     .select("created_time")
      //     .order("created_time", { ascending: false })
      //     .limit(1);
      //   setTimeout(() => {
      //     res(data);
      //   }, 10000);
      // });

      // const { data: lastData2 } = await supabase
      //   .from("kondisi_tapai")
      //   .select("created_time")
      //   .order("created_time", { ascending: false })
      //   .limit(1);

      if (lastData1![0] == lastData2![0]) {
        alert("Device offline!");
      } else if (lastData1![0].created_time == lastData2![0].created_time) {
        alert("Device offline!");
      }
    }
  };

  const checkPengaturan = async () => {
    const { data } = await supabase.from("pengaturan").select("*").limit(1);
    if (data) {
      const item: Pengaturan = data[0];
      setPengaturan(item);

      if (!item.running) {
        if (location.pathname != "/") {
          navigate("/");
        }
      } else {
        setCanNavigate(true);
        await getLastHistori();
        await checkStatusDevice();
        await checkPengaturan();
      }
    }
  };

  const turnOffBuzzer = async () => {
    await supabase.from("pengaturan").update({ buzzer_on: false }).eq("id", 1);
    await checkPengaturan();
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar());
  };

  onMount(async () => {
    await checkPengaturan();
  });

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col text-gray-700">
      <nav class="sticky top-0 left-0 right-0 z-20 bg-white w-full flex items-center justify-between h-20 shadow px-5">
        <button type="button" onClick={toggleSidebar} class="lg:hidden">
          <BarsIcon class="w-6 h-6" />
        </button>
        <div class="text-xl font-medium uppercase">
          <span class="text-primary">Ferm</span>onitor
        </div>
        <div class="space-x-5 flex flex-row">
          <A href="/pengaturan">
            <SettingIcon class="w-6 h-6" />
          </A>
        </div>
      </nav>
      <div class="grow relative">
        <div
          class="fixed top-0 pt-20 left-0 w-72 bg-white shadow h-full px-8 transform lg:translate-x-0 -translate-x-[100%] transition flex flex-col justify-between"
          classList={{ "!translate-x-0": showSidebar() }}
        >
          <div class="mt-10">
            <For each={menus}>
              {(item) => (
                <A
                  href={
                    canNavigate() || item.path != "/pengujian" ? item.path : "/"
                  }
                  class={
                    "flex mb-5 items-center transition " +
                    (location.pathname == item.path ? "text-primary" : "")
                  }
                  onClick={toggleSidebar}
                >
                  <item.icon class="w-5 h-5 mr-3"></item.icon>
                  {item.title}
                </A>
              )}
            </For>
          </div>
          <Show when={pengaturan()?.running}>
            <button
              type="button"
              onClick={fermentasiSelesai}
              class="bg-red-500 text-white w-full p-3 rounded mb-10"
            >
              RESET SISTEM
            </button>
          </Show>
        </div>
        <div class="p-5 lg:ml-72 transition">{props.children}</div>
      </div>

      <Switch>
        <Match when={!!lastHistori() && !lastHistori()?.selesai}>
          <div
            class="bg-black bg-opacity-25 fixed top-0 left-0 right-0 bottom-0 z-[500] items-center justify-center p-5 hidden"
            classList={{ "!flex": !lastHistori()?.selesai }}
          >
            <div class="bg-white rounded shadow p-5 w-full lg:w-1/2">
              <div class="text-xl mb-5">Pemberitahuan</div>
              Fermentasi tapai telah dilakukan dengan hasil{" "}
              <strong class="uppercase">
                {lastHistori()?.berhasil ? "sukses" : "gagal"}
              </strong>
              . Sistem akan melakukan beberapa aksi yaitu:
              <ul class="list list-disc pl-4 my-2">
                <li>
                  menghapus data-data terkait dengan proses fermentasi yang
                  telah dilakukan.
                </li>
                <li>
                  data-data yang dihapus termasuk suhu, kelembaban, dan kadar
                  gas selama fermentasi.
                </li>
              </ul>
              Hasil fermentasi akan di simpan ke histori.
              <div class="mt-8 flex space-x-3 justify-end">
                {/* <button
                  class="bg-gray-400 text-white px-5 py-2 uppercase rounded"
                  onClick={noSaveHistori}
                >
                  Tutup
                </button> */}
                <button
                  class="bg-blue-500 text-white px-5 py-2 uppercase rounded"
                  onClick={saveHistori}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </Match>
      </Switch>
      <button
        type="button"
        class="fixed bottom-10 right-10 transform transition flex p-2 flex-row-reverse items-center inline-block overflow-x-hidden"
        classList={{ "!translate-x-[50vh]": !pengaturan()?.buzzer_on }}
        onClick={turnOffBuzzer}
      >
        <div class="bg-blue-500 z-10 rounded-full h-18 w-18 flex items-center justify-center p-3.5 peer animate-bounce mt-3.5">
          <BellAlert class="text-white w-8 h-8 animate-wiggle" />
        </div>
        <div class="bg-white rounded-full p-3.5 shadow px-8 mr-3 transform transition translate-x-[50vh] peer-hover:translate-x-0">
          Matikan alarm buzzer
        </div>
      </button>
    </div>
  );
}
