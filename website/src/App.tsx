import { A, useLocation, useNavigate } from "@solidjs/router";
import { createSignal, For, JSX, Match, onMount, Switch } from "solid-js";
import SettingIcon from "./icons/SettingIcon";
import HomeIcon from "./icons/HomeIcon";
import ArchiveIcon from "./icons/ArchiveIcon";
import ClockIcon from "./icons/ClockIcon";
import supabase from "./utils/supabase";
import { Histori } from "./types/Histori";
import { Pengaturan } from "./types/Pengaturan";
import BarsIcon from "./icons/BarsIcon";
import AdjusmentIcon from "./icons/AdjusmentIcon";

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
      .eq("selesai", false)
      .order("created_at", { ascending: false });

    if (!!data) {
      setLastHistori(data[0]);
    }
  };

  const deleteAllData = async () => {
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

    setLastHistori(null);

    window.alert("Aksi berhasil dilakukan");
    window.location.reload();
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

    await deleteAllData();
  };

  const noSaveHistori = async () => {
    await supabase
      .from("histori_fermentasi")
      .delete()
      .eq("id", lastHistori()?.id);

    await deleteAllData();
  };

  const checkStatusDevice = async () => {
    await getLastHistori();

    if (!lastHistori()) {
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

      await checkStatusDevice();
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
        await checkStatusDevice();
      }
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar());
  };

  onMount(async () => {
    await checkPengaturan();
  });

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col text-gray-700">
      <nav class="sticky top-0 left-0 right-0 z-20 bg-white w-full flex items-center justify-between h-[70px] shadow px-5">
        <button type="button" onClick={toggleSidebar} class="lg:hidden">
          <BarsIcon class="w-6 h-6" />
        </button>
        <div class="text-xl font-medium uppercase">
          <span class="text-primary">Ferm</span>onitor
        </div>
        <A href="/pengaturan">
          <SettingIcon class="w-6 h-6" />
        </A>
      </nav>
      <div class="grow relative">
        <div
          class="absolute top-0 left-0 lg:block w-72 bg-white shadow h-full px-8 transform lg:translate-x-0 -translate-x-[100%] transition"
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
        </div>
        <div class="p-5 lg:ml-72 transition">{props.children}</div>
      </div>

      <Switch>
        <Match when={!!lastHistori()}>
          <div class="bg-black bg-opacity-25 fixed top-0 left-0 right-0 bottom-0 z-[500] flex items-center justify-center p-5">
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
              Simpan hasil fermentasi ke histori?
              <div class="mt-8 flex space-x-3 justify-end">
                <button
                  class="bg-gray-400 text-white px-5 py-2 uppercase rounded"
                  onClick={noSaveHistori}
                >
                  Tutup
                </button>
                <button
                  class="bg-red-400 text-white px-5 py-2 uppercase rounded"
                  onClick={saveHistori}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
