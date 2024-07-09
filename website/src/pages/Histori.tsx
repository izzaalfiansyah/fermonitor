import { createSignal, onMount } from "solid-js";
import Table from "../components/Table";
import { Histori } from "../types/Histori";
import supabase from "../utils/supabase";
import { getDates } from "../utils/dates";
import TrashIcon from "../icons/TrashIcon";
import { KondisiTapai } from "../types/KondisiTapai";
import RefreshIcon from "../icons/RefreshIcon";

export default function () {
  const [items, setItems] = createSignal<Histori[]>([]);
  const [dataPengujianAwal, setDataPengujianAwal] =
    createSignal<KondisiTapai>();

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
    const isOk = confirm("Anda yakin menghapus history?");

    if (isOk) {
      await supabase.from("histori_fermentasi").delete().eq("id", id);
      await getData();
    }
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
        <div class="flex space-x-3 text-sm items-center mt-5">
          <RefreshIcon class="text-blue-500 w-6 h-6 animate-spin" />{" "}
          <div>: Proses sedang berlangsung</div>
        </div>
        <Table
          headers={[
            "Tanggal",
            "Lama Fermentasi",
            "Rentang Suhu (C)",
            "Status",
            "Opsi",
          ]}
          items={items().map((item) => [
            getDates(item.created_at),
            Math.round((item.waktu_akhir - item.waktu_awal) / 3600) + " Jam",
            item.rentang_suhu,
            <span
              class={
                "uppercase " +
                (item.berhasil ? "text-green-500" : "text-red-500")
              }
            >
              {item.berhasil ? "SUKSES" : "GAGAL"}
            </span>,
            !!dataPengujianAwal() &&
            dataPengujianAwal()!.created_time <= item.waktu_akhir ? (
              <RefreshIcon class="text-blue-500 w-6 h-6 animate-spin" />
            ) : (
              <button
                type="button"
                class="text-orange-500"
                onClick={() => deleteHistory(item.id)}
              >
                <TrashIcon />
              </button>
            ),
          ])}
          class="my-5"
        ></Table>
      </div>
    </div>
  );
}
