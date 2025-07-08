import Product from './Product';

export default interface Gpu extends Product {
  part: string;
  chipset: string;
  memory: string;
  memory_type: string;
  core_clock: string;
  boost_clock: string;
  effective_memory_clock: string;
  interface: string;
  color: string;
  frame_sync: string;
  length: string;
  tdp: string;
  case_expansion_slot_width: number;
  total_slot_width: number;
  cooling: string;
  external_power: string;
  hdmi_outputs: string;
  display_port_outputs: string;
  dvi_d_dual_link_outputs: string;
  hdmi_2_1a_outputs: string;
  display_port_1_4_outputs: string;
  display_port_1_4a_outputs: string;
  display_port_2_1_outputs: string;
  sli_cross_fire: string;
}
