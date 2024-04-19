import { createSignal, onMount, Show } from "solid-js";
import BeakerIcon from "../icons/BeakerIcon";
import EyeDropperIcon from "../icons/EyeDropperIcon";
import { Chart, registerables } from "chart.js";
import supabase from "../utils/supabase";
import { getTimes } from "../utils/dates";

export default function () {
  let canvas: any;
  const [chart, setChart] = createSignal<Chart | null>(null);
  const [suhu, setSuhu] = createSignal<number>(0);
  const [kelembaban, setKelembaban] = createSignal<number>(0);
  const [kadarGas, setKadarGas] = createSignal<number[]>([]);
  const [timeStamps, setTimeStamps] = createSignal<any[]>([]);

  const getData = async () => {
    const { data } = await supabase
      .from("kondisi_tapai")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data != null && data.length > 0) {
      const lastItem = data[0];

      setSuhu(lastItem.suhu);
      setKelembaban(lastItem.kelembaban);
      setKadarGas([]);
      setTimeStamps([]);

      data.forEach((item) => {
        setKadarGas((val) => {
          val.push(item.kadar_gas);
          return val;
        });

        setTimeStamps((val) => {
          val.push(getTimes(item.created_at));
          return val;
        });
      });
    }
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
              max: 50,
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
    }, 1000);
  };

  onMount(async () => {
    Chart.register(...registerables);
    renderChart();
  });

  return (
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
        <div class="flex flex-wrap gap-5">
          <div class="bg-red-500 lg:w-1/2 w-full h-52 rounded shadow text-white flex items-center justify-center">
            <div class="uppercase text-3xl">belum matang</div>
          </div>
          <div class="grid grid-cols-2 grow gap-5 ">
            <div class="bg-white rounded shadow min-h-24 flex flex-col items-center justify-center py-8">
              <EyeDropperIcon class="w-12 h-12 inline-block" />
              <div class="text-3xl mt-5">{suhu()} °C</div>
            </div>
            <div class="bg-white rounded shadow min-h-24 flex flex-col items-center justify-center py-8">
              <BeakerIcon class="w-12 h-12 inline-block" />
              <div class="text-3xl mt-5">{kelembaban()} %</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded shadow p-5">
          <div class="text-xl">Grafik Kadar Gas</div>
          <canvas ref={canvas}></canvas>
        </div>
      </div>
    </div>
  );
}
