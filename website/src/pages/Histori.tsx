import { createSignal, onMount } from "solid-js";
import Table from "../components/Table";
import { Histori, PerubahanKomposisi } from "../types/Histori";
import supabase from "../utils/supabase";
import { getDates } from "../utils/dates";
import TrashIcon from "../icons/TrashIcon";
import { KondisiTapai } from "../types/KondisiTapai";
import ClockIcon from "../icons/ClockIcon";
import ChartBarIcon from "../icons/ChartBarIcon";
import { Chart, registerables } from "chart.js";

export default function () {
  let canvas: any;
  const [items, setItems] = createSignal<Histori[]>([]);
  const [dataPengujianAwal, setDataPengujianAwal] =
    createSignal<KondisiTapai>();
  const [showDetail, setShowDetail] = createSignal<boolean>(false);
  const [dataKomposisi, setDataKomposisi] =
    createSignal<PerubahanKomposisi[]>();
  const [chartDetail, setChartDetail] = createSignal<any>();

  const getData = async () => {
    const { data } = await supabase
      .from("histori_fermentasi")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, 10);

    const { data: kondisi_tapai } = await supabase
      .from("kondisi_tapai")
      .select("created_time")
      .order("created_time", { ascending: true })
      .limit(1);

    setDataPengujianAwal(kondisi_tapai![0] as KondisiTapai);
    setItems(data as Histori[]);
  };

  const deleteHistory = async (id: any) => {
    const isOk = confirm("Anda yakin menghapus histori terpilih?");

    if (isOk) {
      await supabase.from("histori_fermentasi").delete().eq("id", id);
      await getData();
    }
  };

  const renderChart = async (berhasil: boolean) => {
    let labels: any[] = [];
    let values: any[] = [];

    dataKomposisi()?.forEach((item) => {
      labels.push(item.jam_ke);
      values.push(item.kadar_gas);
    });

    chartDetail()?.destroy();

    const chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Kadar Gas",
            data: values,
            borderColor: berhasil ? "lightgreen" : "red",
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
              text: "Kadar Gas Alkohol",
            },
            min: 0,
            max: 10,
            ticks: {
              callback: (val) => {
                return val + "%";
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title(_) {
                return "";
              },
              label(tooltipItem) {
                return (
                  tooltipItem.dataset.label +
                  ": " +
                  tooltipItem.parsed.y.toFixed(2) +
                  "%"
                );
              },
            },
          },
        },
      },
    });

    setChartDetail(chart);
  };

  onMount(async () => {
    await getData();
    Chart.register(...registerables);
  });

  return (
    <>
      <div class="space-y-5">
        <div class="bg-white rounded p-5 shadow">
          <div class="text-xl">Histori</div>
          <p class="text-sm">
            Menampilkan hasil fermentasi yang telah dilakukan.
          </p>
          <div class="flex text-sm items-center mt-5">
            <ClockIcon class="text-blue-500 w-6 h-6 mr-1" />
            <div>: Proses sedang berlangsung</div>
          </div>
          <Table
            headers={[
              "",
              "Tanggal",
              "Lama Fermentasi",
              "Rentang Suhu (C)",
              "Status",
              "",
            ]}
            items={items().map((item) => {
              let sedangBerlangsung: boolean = false;
              if (
                !!dataPengujianAwal() &&
                dataPengujianAwal()!.created_time <= item.waktu_akhir
              ) {
                sedangBerlangsung = true;
              }

              return [
                sedangBerlangsung ? (
                  <div class="text-center">
                    <ClockIcon
                      class="text-blue-500 h-6 w-6 inline animate-spin"
                      style={{ "animation-duration": "2s" }}
                    />
                  </div>
                ) : (
                  ""
                ),
                getDates(item.created_at),
                Math.round((item.waktu_akhir - item.waktu_awal) / 3600) +
                  " Jam",
                item.rentang_suhu,
                <span
                  class={
                    "uppercase " +
                    (item.berhasil ? "text-green-500" : "text-red-500")
                  }
                >
                  {item.berhasil ? "SUKSES" : "GAGAL"}
                </span>,
                <div class="text-center">
                  <button
                    type="button"
                    class="text-blue-400"
                    onClick={() => {
                      setDataKomposisi(item.perubahan_komposisi);
                      renderChart(item.berhasil);
                      setShowDetail(true);
                    }}
                  >
                    <ChartBarIcon />
                  </button>
                  {sedangBerlangsung ? (
                    ""
                  ) : (
                    <button
                      type="button"
                      class="text-orange-500 ml-2"
                      onClick={() => deleteHistory(item.id)}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>,
              ];
            })}
            class="my-5"
          ></Table>
        </div>
      </div>

      <div
        class="bg-black bg-opacity-25 fixed top-0 left-0 right-0 bottom-0 z-[500] items-center justify-center p-5 hidden"
        classList={{ "!flex": showDetail() }}
      >
        <div class="bg-white rounded shadow p-5 w-full lg:w-3/4">
          <div class="text-xl">Detail Histori</div>
          <div class="text-sm mb-5">
            Menampilkan data perubahan kadar gas selama histori proses
            fermentasi.
          </div>
          <canvas ref={canvas} style={{ "max-height": "400px" }}></canvas>
          <div
            class="text-sm text-center -mt-3"
            style={{ "font-family": "Arial" }}
          >
            Jam Ke-
          </div>
          <div class="mt-8 flex space-x-3 justify-end">
            <button
              class="bg-gray-400 text-white px-5 py-2 uppercase rounded"
              onClick={() => setShowDetail(false)}
            >
              TUTUP
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
