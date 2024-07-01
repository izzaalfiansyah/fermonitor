import { createSignal, onMount, Show } from "solid-js";
import BeakerIcon from "../icons/BeakerIcon";
import EyeDropperIcon from "../icons/EyeDropperIcon";
import { Chart, registerables } from "chart.js";
import supabase from "../utils/supabase";
import { getTimes } from "../utils/dates";
import { Histori } from "../types/Histori";
import { Pengaturan } from "../types/Pengaturan";

export default function () {
  let canvas: any;
  const [chart, setChart] = createSignal<Chart | null>(null);
  const [suhu, setSuhu] = createSignal<number>(0);
  const [kelembaban, setKelembaban] = createSignal<number>(0);
  const [kadarGas, setKadarGas] = createSignal<number[]>([]);
  const [timeStamps, setTimeStamps] = createSignal<any[]>([]);

  const [lastHistori, setLastHistori] = createSignal<Histori | null>(null);
  const [pengaturan, setPengaturan] = createSignal<Pengaturan | null>(null);

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

  const getData = async () => {
    const { data } = await supabase
      .from("realtime_data")
      .select("*")
      .eq("id", 1)
      .limit(1);

    if (data != null && data.length > 0) {
      const item = data[0];

      setSuhu(item.suhu);
      setKelembaban(item.kelembaban);
      setKadarGas([]);
      setTimeStamps([]);

      data.forEach((item) => {
        setKadarGas((val) => {
          val.push(item.kadar_gas.toString().slice(0, 4));
          return val;
        });

        setTimeStamps((val) => {
          val.push(getTimes(item.created_time));
          return val;
        });
      });
    }

    // const { data } = await supabase
    //   .from("kondisi_tapai")
    //   .select("*")
    //   .order("created_time", { ascending: false })
    //   .limit(10);

    // if (data != null && data.length > 0) {
    //   const lastItem = data[0];

    //   setSuhu(lastItem.suhu);
    //   setKelembaban(lastItem.kelembaban);
    //   setKadarGas([]);
    //   setTimeStamps([]);

    //   data.forEach((item) => {
    //     setKadarGas((val) => {
    //       val.push(item.kadar_gas.toString().slice(0, 4));
    //       return val;
    //     });

    //     setTimeStamps((val) => {
    //       val.push(getTimes(item.created_time));
    //       return val;
    //     });
    //   });
    // }
  };

  const renderChart = async () => {
    await getData();

    let labels = timeStamps();
    let datas = kadarGas();

    while (labels.length < 10) {
      labels.push("-");
    }

    while (datas.length < 10) {
      datas.push(0);
    }

    if (!chart()) {
      const myChart = new Chart(canvas, {
        type: "line",
        data: {
          labels: labels.reverse(),
          datasets: [
            {
              label: "Kadar Gas",
              data: datas.reverse(),
              borderColor: "#4784f5",
              fill: true,
              cubicInterpolationMode: "monotone",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: "Nilai",
              },
              min: 0,
              max: 10,
            },
          },
        },
      });

      setChart(myChart);
    } else {
      chart()?.data.labels?.splice(0, 1);
      chart()?.data.datasets[0].data.splice(0, 1);

      chart()?.data.labels?.push(getTimes());
      chart()?.data.datasets[0].data.push(kadarGas()[0]);

      chart()?.update();
    }

    setTimeout(async () => {
      await renderChart();
      await getLastHistori();
    }, 4000);
  };

  const getPengaturan = async () => {
    const { data } = await supabase.from("pengaturan").select("*").limit(1);

    if (data) {
      setPengaturan(data[0]);
    }
  };

  const startFermentasi = async () => {
    await supabase.from("pengaturan").update({ running: true }).eq("id", 1);
    window.location.reload();
  };

  const cancelFermentasi = async () => {
    const isOk = confirm("anda yakin untuk membatalkan proses fermentasi?");
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

  onMount(async () => {
    await getPengaturan();
    Chart.register(...registerables);
    await renderChart();
    await getLastHistori();
  });

  return (
    <Show
      when={pengaturan()?.running}
      fallback={
        <div class="space-y-5">
          <div class="bg-white rounded p-5 shadow h-[500px] flex items-center justify-center">
            <button
              class="bg-blue-500 px-4 py-2 uppercase text-white rounded hover:bg-blue-400 transition"
              type="button"
              onClick={startFermentasi}
            >
              MULAI FERMENTASI
            </button>
          </div>
        </div>
      }
    >
      <div class="space-y-5">
        <Show when={!kadarGas()}>
          <div class="bg-white rounded p-5 shadow">Data tidak terdeteksi</div>
          <div class="bg-white rounded p-5 shadow flex items-center justify-center">
            <img
              src="https://www.islandofworldpeace.ie/wp-content/uploads/2019/03/no-image.jpg"
              alt=""
              class="w-[300px] h-[300px]"
            />
          </div>
        </Show>
        <div class={"space-y-5" + (kadarGas().length > 0 ? "" : "hidden")}>
          <div class="flex flex-wrap gap-5 mb-5">
            <div
              class={
                (lastHistori()?.selesai == false
                  ? lastHistori()?.berhasil
                    ? "bg-green-500"
                    : "bg-red-500"
                  : "bg-orange-500") +
                " lg:w-1/2 w-full h-52 rounded shadow text-white flex items-center justify-center"
              }
            >
              <div class="uppercase text-3xl">
                {lastHistori()?.selesai == false
                  ? lastHistori()?.berhasil
                    ? "Matang"
                    : "Gagal"
                  : "Menunggu"}
              </div>
            </div>
            <div class="grid grid-cols-2 grow gap-5 ">
              <div class="bg-white rounded shadow min-h-24 flex flex-col items-center justify-center py-8">
                <EyeDropperIcon class="w-12 h-12 inline-block" />
                <div class="text-3xl mt-5">
                  {suhu().toString().slice(0, 4)} °C
                </div>
              </div>
              <div class="bg-white rounded shadow min-h-24 flex flex-col items-center justify-center py-8">
                <BeakerIcon class="w-12 h-12 inline-block" />
                <div class="text-3xl mt-5">
                  {kelembaban().toString().slice(0, 4)} %
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded p-5 shadow mb-5">
            Terjadi kesalahan dan ingin membatalkan fermentasi? Klik di{" "}
            <a
              href="javascript:void(0);"
              class="text-blue-500"
              onClick={cancelFermentasi}
            >
              sini
            </a>
          </div>
          <div class="bg-white rounded shadow p-5">
            <div class="text-xl">Grafik Kadar Gas</div>
            <canvas ref={canvas} style={{ "max-height": "400px" }}></canvas>
          </div>
        </div>
      </div>
    </Show>
  );
}
