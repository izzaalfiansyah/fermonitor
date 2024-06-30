import { createSignal, onMount } from "solid-js";
import Table from "../components/Table";
import supabase from "../utils/supabase";
import { KondisiTapai } from "../types/KondisiTapai";
import { getDates, getTimes } from "../utils/dates";
import { Chart, registerables } from "chart.js";

export default function () {
  let canvas: any;
  const [items, setItems] = createSignal<KondisiTapai[]>([]);
  const [labels, setLabels] = createSignal<any>([]);

  const getData = async () => {
    const { data } = await supabase
      .from("kondisi_tapai")
      .select("*")
      // .eq("pengujian", true)
      .order("created_time", { ascending: false });

    setItems(data as KondisiTapai[]);
  };

  const renderChart = async () => {
    let labels = [];
    let kadarRegresi = [];
    let kadarAktual: any[] = [];
    let jam: any[] = [];
    let i = 0;
    let j = 0;

    const epochTimeAwal = items()[items().length - 1].created_time;
    items()
      .reverse()
      .forEach((item) => {
        const lamaJam = item.created_time - epochTimeAwal;
        jam.push(Math.round(lamaJam / 3600));
        kadarAktual.push(item.kadar_gas);
      });

    while (i <= 72) {
      const jamPengujian = jam[j];
      const x = jamPengujian || i;
      const nilaiRegresi = (-0.000006 * x ** 2 + 0.0013 * x + 0.002) * 100;
      const nilaiRegresiPertiga = nilaiRegresi / 3;

      kadarRegresi.push(nilaiRegresi - nilaiRegresiPertiga);

      if (jamPengujian) {
        labels.push(jamPengujian.toString());
        i = jamPengujian + 6;
      } else {
        labels.push(i.toString());
        i += 6;
      }

      j += 1;
    }

    setLabels(labels);

    new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Kadar Aktual",
            data: kadarAktual,
            borderColor: "lightgreen",
            cubicInterpolationMode: "monotone",
            tension: 0.4,
          },
          {
            label: "Kadar Regresi",
            data: kadarRegresi,
            borderColor: "#4784f5",
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
  };

  onMount(async () => {
    await getData();
    Chart.register(...registerables);
    await renderChart();
  });

  return (
    <div class="space-y-5">
      <div class="bg-white rounded shadow p-5">
        <div class="text-xl">Analisis Data</div>
        <p class="text-sm mt-3">
          NB : Sistem menampilkan perubahan kandungan dari proses fermentasi
          tiap beberapa jam sekali. Jika kadar aktual signifikan (lebih tinggi
          atau sama dengan dari kadar regresi), maka proses fermentasi
          berpotensi berhasil. Jika kadar aktual dibawah dari kadar regresi,
          maka proses fermentasi berpotensi gagal.
        </p>
      </div>
      <div
        class="bg-white rounded shadow p-5"
        classList={{ hidden: items().length < 1 }}
      >
        <canvas ref={canvas} style={{ "max-height": "300px" }}></canvas>
        <div class="text-sm text-center">Jam Ke-</div>
      </div>
      <div class="bg-white rounded shadow p-5">
        <Table
          class="my-5"
          headers={[
            "Tanggal",
            "Waktu",
            "Jam Ke-",
            "Kadar Gas",
            "Suhu",
            "Kelembaban",
          ]}
          items={items().map((item, i) => [
            getDates(item.created_time),
            getTimes(item.created_time).slice(0, 5),
            labels()[i],
            item.kadar_gas.toString().slice(0, 4) + " %",
            item.suhu.toString().slice(0, 4) + " C",
            item.kelembaban.toString().slice(0, 4) + " %",
          ])}
        ></Table>
      </div>
    </div>
  );
}
