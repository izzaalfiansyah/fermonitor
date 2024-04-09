import BeakerIcon from "../icons/BeakerIcon";
import EyeDropperIcon from "../icons/EyeDropperIcon";

export default function () {
  return (
    <div class="space-y-5">
      <div class="flex flex-wrap gap-5">
        <div class="bg-pink-500 lg:w-1/2 w-full h-52 rounded shadow text-white flex items-center justify-center">
          <div class="uppercase text-3xl">belum matang</div>
        </div>
        <div class="grid grid-cols-2 grow gap-5 ">
          <div class="bg-white rounded shadow min-h-24 flex flex-col items-center justify-center py-8">
            <EyeDropperIcon class="w-12 h-12 inline-block" />
            <div class="text-3xl mt-5">30 °C</div>
          </div>
          <div class="bg-white rounded shadow min-h-24 flex flex-col items-center justify-center py-8">
            <BeakerIcon class="w-12 h-12 inline-block" />
            <div class="text-3xl mt-5">70 %</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded shadow p-5">
        <div class="text-xl">Grafik Kadar Gas</div>
        <div class="h-[300px]"></div>
      </div>
    </div>
  );
}
