import Product from './Product';

export default interface CpuCooler extends Product {
  model: string;
  part: string;
  fan_rpm: string;
  noise_level: string;
  color: string;
  height: string;
  cpu_socket: string;
  water_cooled: string;
  fanless: string;
  specs_number: number;
}
