-- Payment refunds table for VNPay integration
-- This table tracks refund requests and responses

CREATE TABLE public.payment_refunds (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  order_id character varying(50) NOT NULL,
  amount numeric(15, 2) NOT NULL,
  request_data jsonb NOT NULL,
  response_data jsonb NULL,
  status character varying(20) NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  
  CONSTRAINT payment_refunds_pkey PRIMARY KEY (id),
  CONSTRAINT payment_refunds_status_check CHECK (
    status::text = ANY (
      ARRAY[
        'pending'::character varying,
        'completed'::character varying,
        'failed'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

-- Indexes for payment refunds
CREATE INDEX IF NOT EXISTS idx_payment_refunds_order_id ON public.payment_refunds USING btree (order_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_payment_refunds_created_at ON public.payment_refunds USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_payment_refunds_status ON public.payment_refunds USING btree (status) TABLESPACE pg_default;

-- Trigger for updated_at
CREATE TRIGGER update_payment_refunds_updated_at
  BEFORE UPDATE ON payment_refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
