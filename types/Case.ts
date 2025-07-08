import Product from './Product';
export default interface Case extends Product {
  part: string;
  type: string;
  color: string;
  power_supply: string;
  side_panel: string;
  power_supply_shroud: string;
  front_panel_usb: string;
  motherboard_form_factor: string;
  maximum_video_card_length: string;
  drive_bays: string;
  expansion_slots: string;
  dimensions: string;
}
