-- Order tables schema for PCPartPicker mobile app
-- This schema captures the builder state when an order is placed

-- Main orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  builder_id uuid NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'pending',
  total_amount numeric(15, 2) NOT NULL DEFAULT 0,
  currency character varying(3) NOT NULL DEFAULT 'USD',
  shipping_address jsonb NULL,
  billing_address jsonb NULL,
  notes text NULL,
  completed_at timestamp with time zone NULL,
  cancelled_at timestamp with time zone NULL,
  
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT orders_builder_id_fkey FOREIGN KEY (builder_id) REFERENCES public.builder (id) ON DELETE RESTRICT,
  CONSTRAINT orders_status_check CHECK (
    status::text = ANY (
      ARRAY[
        'pending'::character varying,
        'confirmed'::character varying,
        'processing'::character varying,
        'shipped'::character varying,
        'delivered'::character varying,
        'cancelled'::character varying,
        'refunded'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

-- Order items table - captures the specific parts in the builder at order time
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id uuid NOT NULL,
  part_type character varying(50) NOT NULL,
  part_id character varying(50) NOT NULL,
  part_name character varying(255) NOT NULL,
  part_price numeric(10, 2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  part_details jsonb NULL, -- Store snapshot of part details at order time
  
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE CASCADE,
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0)
) TABLESPACE pg_default;

-- Builder snapshot table - stores the complete builder state at order time
CREATE TABLE public.order_builder_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id uuid NOT NULL,
  builder_id uuid NOT NULL,
  user_id uuid NOT NULL,
  builder_parts jsonb NOT NULL, -- Complete snapshot of all parts in the builder
  compatibility_notes jsonb NULL, -- Store any compatibility warnings/notes
  total_estimated_price numeric(15, 2) NULL,
  
  CONSTRAINT order_builder_snapshots_pkey PRIMARY KEY (id),
  CONSTRAINT order_builder_snapshots_order_id_key UNIQUE (order_id),
  CONSTRAINT order_builder_snapshots_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE CASCADE,
  CONSTRAINT order_builder_snapshots_builder_id_fkey FOREIGN KEY (builder_id) REFERENCES public.builder (id) ON DELETE RESTRICT,
  CONSTRAINT order_builder_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_orders_builder_id ON public.orders USING btree (builder_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items USING btree (order_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_order_items_part_type ON public.order_items USING btree (part_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_order_items_part_id ON public.order_items USING btree (part_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_builder_snapshots_order_id ON public.order_builder_snapshots USING btree (order_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_order_builder_snapshots_builder_id ON public.order_builder_snapshots USING btree (builder_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_order_builder_snapshots_user_id ON public.order_builder_snapshots USING btree (user_id) TABLESPACE pg_default;

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for orders table
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Order status history table for tracking status changes
CREATE TABLE public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id uuid NOT NULL,
  previous_status character varying(20) NULL,
  new_status character varying(20) NOT NULL,
  changed_by uuid NULL,
  notes text NULL,
  
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE CASCADE,
  CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users (id) ON DELETE SET NULL
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history USING btree (order_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history USING btree (created_at) TABLESPACE pg_default;

-- Function to create order from builder
CREATE OR REPLACE FUNCTION create_order_from_builder(
  p_user_id uuid,
  p_builder_id uuid,
  p_shipping_address jsonb DEFAULT NULL,
  p_billing_address jsonb DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_part_record RECORD;
  v_total_amount numeric(15, 2) := 0;
  v_builder_parts jsonb;
BEGIN
  -- Create the order
  INSERT INTO public.orders (user_id, builder_id, shipping_address, billing_address, notes, total_amount)
  VALUES (p_user_id, p_builder_id, p_shipping_address, p_billing_address, p_notes, 0)
  RETURNING id INTO v_order_id;
  
  -- Get all builder parts
  SELECT jsonb_object_agg(
    part_type || '_id', 
    jsonb_build_object(
      'part_id', part_id,
      'part_type', part_type,
      'added_at', created_at
    )
  ) INTO v_builder_parts
  FROM public.builder_parts 
  WHERE builder_id = p_builder_id;
  
  -- Create order items for each part in the builder
  FOR v_part_record IN 
    SELECT bp.part_type, bp.part_id, bp.created_at
    FROM public.builder_parts bp
    WHERE bp.builder_id = p_builder_id
  LOOP
    -- Here you would typically fetch part details and price from the respective part tables
    -- For now, we'll insert with placeholder values that should be updated with actual part data
    INSERT INTO public.order_items (
      order_id, 
      part_type, 
      part_id, 
      part_name, 
      part_price,
      part_details
    ) VALUES (
      v_order_id,
      v_part_record.part_type,
      v_part_record.part_id,
      'Part Name', -- This should be fetched from the actual part table
      0.00, -- This should be fetched from the actual part table
      jsonb_build_object(
        'added_to_builder_at', v_part_record.created_at,
        'source_table', v_part_record.part_type || '_detailed'
      )
    );
  END LOOP;
  
  -- Create builder snapshot
  INSERT INTO public.order_builder_snapshots (
    order_id,
    builder_id,
    user_id,
    builder_parts,
    total_estimated_price
  ) VALUES (
    v_order_id,
    p_builder_id,
    p_user_id,
    v_builder_parts,
    v_total_amount
  );
  
  -- Create initial status history entry
  INSERT INTO public.order_status_history (order_id, new_status, changed_by)
  VALUES (v_order_id, 'pending', p_user_id);
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust as needed for your RLS policies)
-- Note: You may need to adjust these grants based on your Supabase RLS setup
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_builder_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust as needed)
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own order snapshots" ON public.order_builder_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own order status history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_status_history.order_id 
      AND orders.user_id = auth.uid()
    )
  );
