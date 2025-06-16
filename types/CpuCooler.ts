import Product from './Product';

export default interface CpuCooler extends Product {
  model: string;
  part: string;
  fanRpm: string;
  noiseLevel: string;
  color: string;
  height: string;
  cpuSocket: string;
  waterCooled: string;
  fanless: string;
  specs_number: number;
}
