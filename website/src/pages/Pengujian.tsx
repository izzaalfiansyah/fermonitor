import Table from "../components/Table";

export default function () {
  return (
    <div class="space-y-5">
      <div class="bg-white rounded shadow p-5">
        Keterangan : Kondisi tape dalam keadaan kurang baik. Perubahan kadar
        gas, suhu, dan kelembaban tidak signifikan. kemungkinan fermentasi
        gagal.
      </div>
      <div class="bg-white rounded shadow p-5">
        <Table
          class="my-5"
          headers={["Tanggal", "Jam", "Kadar Gas", "Suhu", "Kelembaban"]}
          items={[
            ["23 Maret 2024", "08:00", "20%", "35 C", "50%"],
            ["23 Maret 2024", "14:00", "23%", "35 C", "60%"],
            ["23 Maret 2024", "20:00", "23%", "35 C", "65%"],
            ["24 Maret 2024", "02:00", "23%", "35 C", "65%"],
          ]}
        ></Table>
      </div>
    </div>
  );
}
