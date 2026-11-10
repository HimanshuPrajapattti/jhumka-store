CREATE OR REPLACE FUNCTION public.save_site_appearance(p_settings jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF jsonb_typeof(p_settings) <> 'array'
     OR jsonb_array_length(p_settings) <> 4
     OR EXISTS (
       SELECT 1
       FROM jsonb_to_recordset(p_settings) AS setting(key text, value text, asset_key text)
       WHERE key NOT IN (
         'appearance.heroImage',
         'appearance.homeBackgroundImage',
         'appearance.siteBackgroundImage',
         'appearance.siteBackgroundColor'
       )
          OR value IS NULL
     ) THEN
    RAISE EXCEPTION 'Invalid appearance settings.';
  END IF;

  INSERT INTO public.site_settings (key, value, asset_key)
  SELECT key, value, asset_key
  FROM jsonb_to_recordset(p_settings) AS setting(key text, value text, asset_key text)
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      asset_key = EXCLUDED.asset_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_store_dashboard_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'revenue', (
      SELECT COALESCE(sum(total) FILTER (WHERE status <> 'cancelled'), 0)
      FROM public.orders
    ),
    'orderCount', (SELECT count(*) FROM public.orders),
    'pendingCount', (
      SELECT count(*) FROM public.orders WHERE status = 'pending'
    ),
    'productCount', (SELECT count(*) FROM public.products),
    'unitCount', (
      SELECT COALESCE(sum(oi.qty), 0)
      FROM public.order_items AS oi
      JOIN public.orders AS o ON o.id = oi.order_id
      WHERE o.status <> 'cancelled'
    ),
    'salesByDay', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('day', day, 'total', total)
        ORDER BY day
      )
      FROM (
        SELECT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
               COALESCE(sum(total) FILTER (WHERE status <> 'cancelled'), 0) AS total
        FROM public.orders
        WHERE created_at >= date_trunc('day', now()) - interval '13 days'
        GROUP BY 1
      ) AS daily
    ), '[]'::jsonb),
    'topProducts', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('name', name, 'qty', qty, 'revenue', revenue)
        ORDER BY revenue DESC
      )
      FROM (
        SELECT oi.product_name AS name,
               sum(oi.qty) AS qty,
               sum(oi.qty * oi.price) AS revenue
        FROM public.order_items AS oi
        JOIN public.orders AS o ON o.id = oi.order_id
        WHERE o.status <> 'cancelled'
        GROUP BY oi.product_name
        ORDER BY revenue DESC
        LIMIT 5
      ) AS top_products
    ), '[]'::jsonb),
    'recentOrders', COALESCE((
      SELECT jsonb_agg(recent.order_data ORDER BY recent.created_at DESC)
      FROM (
        SELECT o.created_at,
               to_jsonb(o) || jsonb_build_object(
                 'items', COALESCE((
                   SELECT jsonb_agg(to_jsonb(oi) ORDER BY oi.id)
                   FROM public.order_items AS oi
                   WHERE oi.order_id = o.id
                 ), '[]'::jsonb),
                 'item_count', COALESCE((
                   SELECT sum(oi.qty)
                   FROM public.order_items AS oi
                   WHERE oi.order_id = o.id
                 ), 0)
               ) AS order_data
        FROM public.orders AS o
        ORDER BY o.created_at DESC
        LIMIT 6
      ) AS recent
    ), '[]'::jsonb)
  );
$$;

CREATE OR REPLACE FUNCTION public.sync_product_id_sequence()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  max_id bigint;
  sequence_name text;
BEGIN
  SELECT max(id) INTO max_id FROM public.products;
  sequence_name := pg_get_serial_sequence('public.products', 'id');
  IF sequence_name IS NULL THEN
    RAISE EXCEPTION 'Could not locate products ID sequence.';
  END IF;
  RETURN setval(
    sequence_name,
    COALESCE(max_id, 1),
    max_id IS NOT NULL
  );
END;
$$;

REVOKE ALL ON FUNCTION public.save_site_appearance(jsonb)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_store_dashboard_stats()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_product_id_sequence()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_site_appearance(jsonb) TO project_admin;
GRANT EXECUTE ON FUNCTION public.get_store_dashboard_stats() TO project_admin;
GRANT EXECUTE ON FUNCTION public.sync_product_id_sequence() TO project_admin;