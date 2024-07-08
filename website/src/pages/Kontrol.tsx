import { createSignal, onMount } from "solid-js";
import supabase from "../utils/supabase";
import { Pengaturan } from "../types/Pengaturan";
import { Show } from "solid-js";

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

  const handleSubmit = async (e: SubmitEvent | null = null) => {
    e?.preventDefault();

    const suhu_min = parseInt(req()?.suhu_min as any);
    const suhu_max = parseInt(req()?.suhu_max as any);

    if (suhu_min >= suhu_max) {
      alert("suhu maximal harus lebih besar dari suhu minimal");
    } else {
      await supabase.from("pengaturan").update(req()).eq("id", 1);

      if (e) {
        alert("data berhasil disimpan");
      }
    }

    await getData();
  };

  const getSuhu = () => {
    let suhu = [];
    for (let i = 30; i <= 40; i++) {
      suhu.push(i);
    }

    return suhu;
  };

  onMount(async () => {
    await getData();
  });

  return (
    <div class="space-y-5">
      <div class="grid lg:grid-cols-2 gap-5">
        <div class="bg-white shadow p-5 rounded">
          <div class="text-xl">Kontrol Alarm</div>
          <p class="text-sm">Matikan buzzer alarm setelah selang waktu</p>
          <select
            value={parseInt(req()?.buzzer_timer as any)}
            onChange={(e) => {
              console.log(e.currentTarget.value);
              handleReqChange("buzzer_timer", e.currentTarget.value);
              handleSubmit();
            }}
            class="input max-w-xl mt-3"
          >
            <option value="15">15 detik</option>
            <option value="30">30 detik</option>
            <option value="60">1 menit</option>
            <option value={(60 * 2).toString()}>2 menit</option>
            <option value={(60 * 5).toString()}>5 menit</option>
          </select>
        </div>
        <div class="bg-white rounded p-5 shadow">
          <div class="text-xl">Kontrol Alat</div>
          <p class="text-sm">
            Atur pengendalian suhu secara otomatis atau secara manual
          </p>
          <div class="mt-3">
            <label class="inline-flex items-center cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={req()?.auto}
                onChange={(e) => {
                  handleReqChange("auto", e.currentTarget.checked);
                  handleSubmit();
                }}
                class="sr-only peer"
              />
              <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {req()?.auto ? "Otomatis" : "Manual"}
              </span>
            </label>
          </div>
        </div>
      </div>
      <Show
        when={req()?.auto}
        fallback={
          <div class="bg-white rounded p-5 shadow">
            <div class="my-5">
              <div class="mb-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="mb-1">Lampu</div>
                    <label class="inline-flex items-center cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={req()?.lamp_on}
                        onChange={(e) => {
                          handleReqChange("lamp_on", e.currentTarget.checked);
                          handleSubmit();
                        }}
                        class="sr-only peer"
                      />
                      <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {req()?.lamp_on ? "ON" : "OFF"}
                      </span>
                    </label>
                  </div>
                  <div>
                    <div class="mb-1">Kipas</div>
                    <label class="inline-flex items-center cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={req()?.fan_on}
                        onChange={(e) => {
                          handleReqChange("fan_on", e.currentTarget.checked);
                          handleSubmit();
                        }}
                        class="sr-only peer"
                      />
                      <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {req()?.fan_on ? "ON" : "OFF"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div class="bg-white rounded p-5 shadow" onSubmit={handleSubmit}>
          <div class="my-5">
            <div class="mb-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="mb-1">Suhu Min</div>
                  <select
                    value={req()?.suhu_min}
                    onChange={(e) => {
                      handleReqChange("suhu_min", e.currentTarget.value);
                      handleSubmit();
                    }}
                    class="input"
                  >
                    {getSuhu().map((i) => (
                      <option value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div class="mb-1">Suhu Max</div>
                  <select
                    value={req()?.suhu_max}
                    onChange={(e) => {
                      handleReqChange("suhu_max", e.currentTarget.value);
                      handleSubmit();
                    }}
                    class="input"
                  >
                    {getSuhu().map((i) => (
                      <option value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
