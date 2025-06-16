import Product from './Product';
export default interface Case extends Product {
  part: string;
  type: string;
  color: string;
  powerSupply: string;
  sidePanel: string;
  powerSupplyShroud: string;
  frontPanelUsb: string;
  motherboardFormFactor: string;
  maximumVideoCardLength: string;
  driveBays: string;
  expansionSlots: string;
  dimensions: string;
}
