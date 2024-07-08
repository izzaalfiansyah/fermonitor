export interface Pengaturan {
    id: number;
    email: string;
    telepon: string;
    suhu_min: number;
    suhu_max: number;
    running: boolean;
    auto: boolean;
    fan_on: boolean;
    lamp_on: boolean;
    buzzer_timer: number;
    buzzer_on: boolean;
}