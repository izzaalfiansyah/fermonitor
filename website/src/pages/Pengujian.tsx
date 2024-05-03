import { createSignal, onMount } from "solid-js";
import Table from "../components/Table";
import supabase from "../utils/supabase";
import { KondisiTapai } from "../types/KondisiTapai";
import { getDates, getTimes } from "../utils/dates";

export default function () {
  const [items, setItems] = createSignal<KondisiTapai[]>([]);

  const getData = async () => {
    const { data } = await supabase
      .from("kondisi_tapai")
      .select("*")
      .eq("pengujian", true)
      .order("created_time", { ascending: false });

    setItems(data as KondisiTapai[]);
  };

  onMount(async () => {
    await getData();
  });

  return (
    <div class="space-y-5">
      <div class="bg-white rounded shadow p-5">
        Keterangan : Kondisi tape dalam keadaan kurang baik. Perubahan kadar
        gas, suhu, dan kelembaban tidak signifikan. kemungkinan fermentasi
        gagal.
      </div>
      <div class="bg-white rounded shadow p-5">
        <div class="text-xl">Analisis Data</div>
        <p class="text-sm">
          Menampilkan perubahan kandungan dari proses fermentasi selama 6 jam
          sekali.
        </p>
        <Table
          class="my-5"
          headers={["Tanggal", "Jam", "Kadar Gas", "Suhu", "Kelembaban"]}
          items={items().map((item) => [
            getDates(item.created_time),
            getTimes(item.created_time).slice(0, 5),
            item.kadar_gas.toString().slice(0, 4) + " %",
            item.suhu.toString().slice(0, 4) + " C",
            item.kelembaban.toString().slice(0, 4) + " %",
          ])}
        ></Table>
      </div>
    </div>
  );
}
