export function getTimes(epochtime: any = null) {
    const dates = !!epochtime ? new Date(epochtime * 1000 - 7000 * 3600) : new Date();

    const hour = dates.getHours() < 10 ? '0' + dates.getHours() : dates.getHours();
    const minute = dates.getMinutes() < 10 ? '0' + dates.getMinutes() : dates.getMinutes();
    const second = dates.getSeconds() < 10 ? '0' + dates.getSeconds() : dates.getSeconds();

    const his = hour + ":" + minute + ":" + second;

    return his;
}

export function getDates(epochtime: any = null) {
    const dates = !!epochtime ? new Date((typeof epochtime == 'number') ? epochtime * 1000 - 7000 * 3600 : epochtime) : new Date();

    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const year = dates.getFullYear();
    const month = bulan[dates.getMonth()];

    return dates.getDate() + ' ' + month + ' ' + year;
}

export function getTimeDiff(firstDate: string, lastDate: string) {
    const date_awal = new Date(firstDate);
    const date_akhir = new Date(lastDate);

    const date_diff = date_akhir.getTime() - date_awal.getTime();
    
    return date_diff;
}