import { createSignal, onMount } from "solid-js";
import supabase from "../utils/supabase";
import { Pengaturan } from "../types/Pengaturan";

export default function () {
  const [req, setReq] = createSignal<Pengaturan>();

  const getData = async () => {
    const { data } = await supabase.from("pengaturan").select("*").eq("id", 1);

    if (!!data) {
      setReq(data[0]);
    }
  };

  const handleReqChange = (key: keyof Pengaturan, value: any) => {
    setReq((val) => {
      (val as any)[key] = value;
      return val;
    });
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    await supabase.from("pengaturan").update(req()).eq("id", 1);

    alert("data berhasil disimpan");
  };

  onMount(async () => {
    await getData();
  });

  return (
    <div class="space-y-5">
      <div class="bg-white rounded p-5 shadow">
        <p class="text-sm">
          NB : Pada akun telegram, Anda perlu memberikan otorisasi pada
          CallMeBot untuk dapat memberikan notifikasi dan menghubungi akun anda!
          Anda dapat menggunakan{" "}
          <a
            class="text-blue-500"
            href="https://api2.callmebot.com/txt/login.php"
            target="_blank"
          >
            tautan ini
          </a>
          . Atau alternatif lain, Anda dapat memulai chat bot "/start" ke
          @CallMeBot_txtbot. Untuk informasi lain anda dapat mengakses tautan{" "}
          <a class="text-blue-500" href="callmebot.com/faq">
            callmebot.com
          </a>
        </p>
      </div>
      <form class="bg-white rounded p-5 shadow" onSubmit={handleSubmit}>
        <div class="text-xl">Kontak Pemilik</div>
        <p class="text-sm">
          Kontak digunakan untuk mengirimkan notifikasi sistem kepada pemilik.
        </p>
        <div class="my-5">
          <div class="mb-3">
            <div class="mb-1">Email</div>
            <input
              type="text"
              class="input"
              placeholder="Masukkan Email"
              value={req()?.email}
              onInput={(e) => handleReqChange("email", e.target.value)}
              required
            />
          </div>
          <div class="mb-3">
            <div class="mb-1">Username / Nomor Telegram</div>
            <input
              type="text"
              class="input"
              placeholder="Masukkan Username / Nomor Telegram"
              value={req()?.telepon}
              onInput={(e) => handleReqChange("telepon", e.target.value)}
              required
            />
          </div>
        </div>
        {/* <div class="h-8"></div>
        <div class="text-xl">Kontrol Fermentasi</div>
        <p class="text-sm">
          Pemilik bisa mengatur environment untuk pengendalian suhu optimal pada
          fermentasi tape.
        </p>
        <div class="my-5">
          <div class="mb-3">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="mb-1">Suhu Min</div>
                <input
                  type="number"
                  min={0}
                  class="input"
                  value={req()?.suhu_min}
                  onInput={(e) => handleReqChange("suhu_min", e.target.value)}
                />
              </div>
              <div>
                <div class="mb-1">Suhu Max</div>
                <input
                  type="number"
                  max={100}
                  class="input"
                  value={req()?.suhu_max}
                  onInput={(e) => handleReqChange("suhu_max", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div> */}
        <div class="h-8"></div>
        <button
          class="bg-blue-500 transition focus:bg-blue-400 text-white rounded shadow-sm uppercase p-3 px-6 w-full"
          type="submit"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
