import { createSignal, onMount } from "solid-js";
import Table from "../components/Table";
import { Histori } from "../types/Histori";
import supabase from "../utils/supabase";
import { getDates } from "../utils/dates";

export default function () {
  const [items, setItems] = createSignal<Histori[]>([]);

  const getData = async () => {
    const { data } = await supabase
      .from("histori_fermentasi")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, 10);

    setItems(data as Histori[]);
  };

  onMount(async () => {
    await getData();
  });

  return (
    <div class="space-y-5">
      <div class="bg-white rounded p-5 shadow">
        <div class="text-xl">Histori</div>
        <p class="text-sm">
          Menampilkan hasil fermentasi yang telah dilakukan.
        </p>
        <Table
          headers={[
            "Tanggal",
            "Lama Fermentasi" /*, "Rentang Suhu"*/,
            "Status",
          ]}
          items={items().map((item) => [
            getDates(item.created_at),
            Math.round((item.waktu_akhir - item.waktu_awal) / 3600) + " Jam",
            // item.rentang_suhu + " C",
            <span
              class={
                "uppercase " +
                (item.berhasil ? "text-green-500" : "text-red-500")
              }
            >
              {item.berhasil ? "SUKSES" : "GAGAL"}
            </span>,
          ])}
          class="my-5"
        ></Table>
      </div>
    </div>
  );
}
