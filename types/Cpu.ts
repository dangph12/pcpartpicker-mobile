import Product from './Product';
export default interface Cpu extends Product {
  manufacturer: string;
  part: string;
  series: string;
  microarchitecture: string;
  coreFamily: string;
  socket: string;
  coreCount: number;
  performanceCoreClock: string;
  performanceCoreBoostClock: string;
  efficiencyCoreClock: string;
  efficiencyCoreBoostClock: string;
  l2Cache: string;
  l3Cache: string;
  tdp: string;
  integratedGraphics: string;
  maximumSupportedMemory: string;
  eccSupport: string;
  includesCooler: string;
  packaging: string;
  lithography: string;
  includesCpuCooler: string;
  simultaneousMultithreading: string;
}
