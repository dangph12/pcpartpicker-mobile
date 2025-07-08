import Product from './Product';
export default interface Cpu extends Product {
  part: string;
  series: string;
  microarchitecture: string;
  core_family: string;
  socket: string;
  core_count: number;
  performance_core_clock: string;
  performance_core_boost_clock: string;
  efficiency_core_clock: string;
  efficiency_core_boost_clock: string;
  l2_cache: string;
  l3_cache: string;
  tdp: string;
  integrated_graphics: string;
  maximum_supported_memory: string;
  ecc_support: string;
  includes_cooler: string;
  packaging: string;
  lithography: string;
  includes_cpu_cooler: string;
  simultaneous_multithreading: string;
}
