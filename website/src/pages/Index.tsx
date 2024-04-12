import { createSignal, onMount } from "solid-js";
import BeakerIcon from "../icons/BeakerIcon";
import EyeDropperIcon from "../icons/EyeDropperIcon";
import { Chart, registerables } from "chart.js";

export default function () {
  let canvas: any;
  const [chart, setChart] = createSignal<Chart | null>(null);

  const renderChart = () => {
    const date = new Date();
    const his =
      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    const val = Math.round(Math.random() * 30);

    let labels = [his];
    let data = [val];

    while (labels.length < 10) {
      labels.push("-");
    }

    while (data.length < 10) {
      data.push(0);
    }

    if (!chart()) {
      const myChart = new Chart(canvas, {
        type: "line",
        data: {
          labels: labels.reverse(),
          datasets: [
            {
              label: "Kadar Gas",
              data: data.reverse(),
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
              suggestedMin: 0,
              suggestedMax: 50,
            },
          },
        },
      });

      setChart(myChart);
    } else {
      chart()?.data.labels?.splice(0, 1);
      chart()?.data.labels?.push(his);
      chart()?.data.datasets[0].data.splice(0, 1);
      chart()?.data.datasets[0].data.push(val);

      chart()?.update();
    }

    setTimeout(renderChart, 1000);
  };

  onMount(() => {
    Chart.register(...registerables);
    renderChart();
  });

  return (
    <div class="space-y-5">
      <div class="flex flex-wrap gap-5">
        <div class="bg-red-500 lg:w-1/2 w-full h-52 rounded shadow text-white flex items-center justify-center">
          <div class="uppercase text-3xl">belum matang</div>
        </div>
        <div class="grid grid-cols-2 grow gap-5 ">
          <div class="bg-white rounded shadow min-h-24 flex flex-col items-center justify-center py-8">
            <EyeDropperIcon class="w-12 h-12 inline-block" />
            <div class="text-3xl mt-5">30 °C</div>
          </div>
          <div class="bg-white rounded shadow min-h-24 flex flex-col items-center justify-center py-8">
            <BeakerIcon class="w-12 h-12 inline-block" />
            <div class="text-3xl mt-5">70 %</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded shadow p-5">
        <div class="text-xl">Grafik Kadar Gas</div>
        <canvas ref={canvas}></canvas>
      </div>
    </div>
  );
}
