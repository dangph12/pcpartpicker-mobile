import Product from './Product';

export default interface Motherboard extends Product {
  part: string;
  socket_over_cpu: string;
  form_factor: string;
  chipset: string;
  memory_max: string;
  memory_type: string;
  memory_slots: number;
  memory_speed: string;
  color: string;
  pcie_x16_slots: number;
  pcie_x8_slots: string;
  pcie_x4_slots: string;
  pcie_x1_slots: number;
  pci_slots: string;
  m_2_slots: string;
  mini_pcie_slots: string;
  half_mini_pcie_slots: string;
  mini_pcie_over_msata_slots: string;
  msata_slots: string;
  sata_6_0_gb_over_second: number;
  onboard_ethernet: string;
  onboard_video: string;
  usb_2_0_headers: number;
  usb_2_0_headers_single_port: string;
  usb_3_2_gen_1_headers: number;
  usb_3_2_gen_2_headers: number;
  usb_3_2_gen_2x2_headers: string;
  supports_ecc: string;
  wireless_networking: string;
  raid_support: string;
}
