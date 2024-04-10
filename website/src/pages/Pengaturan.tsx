export default function () {
  return (
    <div class="bg-white rounded p-5 shadow">
      <div class="text-xl">Kontak Pemilik</div>
      <p class="text-sm">
        Kontak digunakan untuk mengirimkan notifikasi sistem kepada pemilik.
      </p>
      <div class="my-5">
        <div class="mb-3">
          <div class="mb-1">Email</div>
          <input type="text" class="input" placeholder="Masukkan Email" />
        </div>
        <div class="mb-3">
          <div class="mb-1">No. Whatsapp</div>
          <input
            type="text"
            class="input"
            placeholder="Masukkan No. Whatsapp"
          />
        </div>
      </div>
      <div class="h-8"></div>
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
              <input type="text" class="input" value={30} />
            </div>
            <div>
              <div class="mb-1">Suhu Max</div>
              <input type="text" class="input" value={40} />
            </div>
          </div>
        </div>
      </div>
      <div class="h-8"></div>
      <button class="bg-blue-500 transition focus:bg-blue-400 text-white rounded shadow-sm uppercase p-3 px-6 w-full">
        Simpan
      </button>
    </div>
  );
}
