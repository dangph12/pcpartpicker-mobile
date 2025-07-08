import Product from './Product';

export default interface Memory extends Product {
  part: string;
  speed: string;
  form_factor: string;
  modules: string;
  price_over_gb: string;
  color: string;
  first_word_latency: string;
  cas_latency: number;
  voltage: string;
  timing: string;
  ecc_over_registered: string;
  heat_spreader: string;
  specs_number: number;
}
