import Table from "../components/Table";

export default function () {
  return (
    <div class="space-y-5">
      <div class="bg-white rounded p-5 shadow">
        <Table
          headers={["Tanggal", "Lama Fermentasi", "Rentang Suhu", "Status"]}
          items={[
            [
              "24 Maret 2024",
              "32 Jam",
              "35 - 40 C",
              <span class="uppercase text-green-500">SUKSES</span>,
            ],
            [
              "23 Maret 2024",
              "6 Jam",
              "25- 35 C",
              <span class="uppercase text-red-500">GAGAL</span>,
            ],
            [
              "22 Maret 2024",
              "24 Jam",
              "30 - 40 C",
              <span class="uppercase text-green-500">SUKSES</span>,
            ],
            [
              "24 Maret 2024",
              "24 Jam",
              "30 - 40 C",
              <span class="uppercase text-green-500">SUKSES</span>,
            ],
          ]}
          class="my-5"
        ></Table>
      </div>
    </div>
  );
}
