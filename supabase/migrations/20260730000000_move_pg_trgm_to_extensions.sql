-- Move pg_trgm out of the API-exposed schema.
--
-- 20260724000001 ran `create extension if not exists pg_trgm;` with no schema, so it
-- landed in `public` while every other extension in this project lives in `extensions`.
-- `public` is exposed by the Data API (config.toml [api] schemas), which made the
-- extension's functions callable unauthenticated as RPC — e.g.
-- `GET /rest/v1/rpc/show_limit` answered 200 with the anon key.
--
-- No recipe data was reachable that way (these are string helpers), but the same
-- mistake on a future extension would inherit the same public RPC surface.
--
-- Migrations are append-only, so this moves the extension in a new file instead of
-- editing 20260724000001. `extensions` is already in [api] extra_search_path, so the
-- app keeps resolving trigram functions, and `recipes_title_trgm_idx` keeps working:
-- an index references its operator class by OID, not by schema name.

alter extension pg_trgm set schema extensions;
