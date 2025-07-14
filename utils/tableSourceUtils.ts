// Just create a table source object

export const tableSourceMap = {
  cases_detailed: {
    id: 'cases_detailed',
    name: 'PC Cases',
    description: 'Browse computer cases and enclosures',
    productType: 'Case',
    table: 'cases_detailed',
  },
  cpus_detailed: {
    id: 'cpus_detailed',
    name: 'CPUs',
    description: 'Browse processors and CPUs',
    productType: 'Cpu',
    table: 'cpus_detailed',
  },
  gpus_detailed: {
    id: 'gpus_detailed',
    name: 'GPUs',
    description: 'Browse graphics cards and GPUs',
    productType: 'Gpu',
    table: 'gpus_detailed',
  },
  motherboards_detailed: {
    id: 'motherboards_detailed',
    name: 'Motherboards',
    description: 'Browse motherboards and mainboards',
    productType: 'Motherboard',
    table: 'motherboards_detailed',
  },
  memory_detailed: {
    id: 'memory_detailed',
    name: 'Memory',
    description: 'Browse system memory and RAM',
    productType: 'Memory',
    table: 'memory_detailed',
  },
  storage_detailed: {
    id: 'storage_detailed',
    name: 'Storage',
    description: 'Browse hard drives and SSDs',
    productType: 'Storage',
    table: 'storage_detailed',
  },
  power_supplies_detailed: {
    id: 'power_supplies_detailed',
    name: 'Power Supplies',
    description: 'Browse power supply units',
    productType: 'PowerSupply',
    table: 'power_supplies_detailed',
  },
  cpu_coolers_detailed: {
    id: 'cpu_coolers_detailed',
    name: 'CPU Coolers',
    description: 'Browse CPU cooling solutions',
    productType: 'CpuCooler',
    table: 'cpu_coolers_detailed',
  },
};

// TypeScript type for the table source map
export type TableSourceKey = keyof typeof tableSourceMap;
