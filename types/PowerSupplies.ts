import Product from './Product';

export default interface PowerSupply extends Product {
  model: string;
  part: string;
  type: string;
  efficiency_rating: string;
  wattage: string;
  length: string;
  modular: string;
  color: string;
  fanless: string;
  atx_4_pin_connectors: string;
  eps_8_pin_connectors: number;
  pcie_12_plus_4_pin_12VHPWR_connectors: number;
  pcie_2_pin_connectors: string;
  pcie_8_pin_connectors: string;
  pcie_6_plus_2_pin_connectors: number;
  pcie_6_pin_connectors: string;
  sata_connectors: number;
  molex_4_pin_connectors: number;
  specs_number: number;
}
