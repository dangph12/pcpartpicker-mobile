create table public.storage_detailed (
  id uuid not null default gen_random_uuid (),
  name text null,
  image_url text null,
  product_url text null,
  price text null,
  manufacturer text null,
  part text null,
  capacity text null,
  price_over_gb text null,
  type text null,
  cache text null,
  form_factor text null,
  interface text null,
  nvme text null,
  constraint storage_detailed_pkey primary key (id)
) TABLESPACE pg_default;