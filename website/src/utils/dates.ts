export function getTimes(date: any = null) {
    const dates = !!date ? new Date(date) : new Date();

    const hour = dates.getHours() < 10 ? '0' + dates.getHours() : dates.getHours();
    const minute = dates.getMinutes() < 10 ? '0' + dates.getMinutes() : dates.getMinutes();
    const second = dates.getSeconds() < 10 ? '0' + dates.getSeconds() : dates.getSeconds();

    const his = hour + ":" + minute + ":" + second;

    return his;
}

export function getDates(date: any = null) {
    const dates = !!date ? new Date(date) : new Date();

    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const year = dates.getFullYear();
    const month = bulan[dates.getMonth()];

    return dates.getDate() + ' ' + month + ' ' + year;
}