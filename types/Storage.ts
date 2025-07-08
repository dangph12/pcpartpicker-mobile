import Product from './Product';

export default interface Storage extends Product {
  part: string;
  capacity: string;
  price_over_gb: string;
  type: string;
  cache: string;
  form_factor: string;
  interface: string;
  nvme: string;
}
