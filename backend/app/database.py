from supabase import create_client, Client
from supabase._async.client import create_client as async_create_client, AsyncClient
from app.config import settings

# Create a Supabase client using the anon key (public)
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

# Create a Supabase client using the service role key (admin/bypass RLS)
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_key)

# Create an async admin client to avoid blocking the event loop on auth
supabase_async_admin: AsyncClient = AsyncClient(settings.supabase_url, settings.supabase_service_key)
