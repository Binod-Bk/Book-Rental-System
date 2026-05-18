-- ============================================================
-- Kitab Bhandar — Full Database Schema
-- Run this entire file in: Supabase → SQL Editor → New Query
-- ============================================================


-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ── Helper: check if current user is admin ──────────────────
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;


-- ============================================================
-- TABLE 1: users (public profile — mirrors auth.users)
-- ============================================================
create table if not exists public.users (
  id                uuid primary key references auth.users(id) on delete cascade,
  name              text not null,
  email             text not null unique,
  phone             text,
  role              text not null default 'user' check (role in ('user', 'admin')),
  referral_code     text not null unique default upper(substring(gen_random_uuid()::text, 1, 8)),
  referred_by       uuid references public.users(id),
  referral_credits  integer not null default 0,
  is_blacklisted    boolean not null default false,
  created_at        timestamptz not null default now()
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.phone
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- TABLE 2: pickup_locations
-- ============================================================
create table if not exists public.pickup_locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('library', 'cafe')),
  district    text not null check (district in ('Kathmandu', 'Bhaktapur', 'Lalitpur', 'Pokhara', 'Other')),
  address     text not null,
  contact     text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);


-- ============================================================
-- TABLE 3: books
-- ============================================================
create table if not exists public.books (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  author            text not null,
  isbn              text,
  category          text not null,
  college           text,
  condition         text not null check (condition in ('new', 'good', 'acceptable')),
  deposit_tier      text not null check (deposit_tier in ('standard', 'premium')),
  quantity          integer not null default 1 check (quantity >= 0),
  cover_image_url   text,
  times_rented      integer not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists books_category_idx  on public.books(category);
create index if not exists books_college_idx   on public.books(college);
create index if not exists books_condition_idx on public.books(condition);
create index if not exists books_title_idx     on public.books using gin(to_tsvector('english', title));
create index if not exists books_author_idx    on public.books using gin(to_tsvector('english', author));


-- ============================================================
-- TABLE 4: rentals
-- ============================================================
create table if not exists public.rentals (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete restrict,
  book_id             uuid not null references public.books(id) on delete restrict,
  pickup_location_id  uuid not null references public.pickup_locations(id) on delete restrict,
  rent_date           date not null default current_date,
  due_date            date not null default (current_date + interval '21 days'),
  returned_at         timestamptz,
  status              text not null default 'active'
                        check (status in ('active', 'returned', 'overdue', 'lost', 'renewed')),
  deposit_amount      integer not null,
  deposit_refunded    integer,
  renewal_count       integer not null default 0,
  created_at          timestamptz not null default now()
);

create index if not exists rentals_user_idx    on public.rentals(user_id);
create index if not exists rentals_book_idx    on public.rentals(book_id);
create index if not exists rentals_status_idx  on public.rentals(status);
create index if not exists rentals_due_idx     on public.rentals(due_date);

-- Decrement book quantity when rental is created
create or replace function public.decrement_book_quantity()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.books
  set quantity = quantity - 1,
      times_rented = times_rented + 1
  where id = new.book_id;
  return new;
end;
$$;

drop trigger if exists on_rental_created on public.rentals;
create trigger on_rental_created
  after insert on public.rentals
  for each row execute function public.decrement_book_quantity();

-- Restore book quantity when rental is returned/lost
create or replace function public.restore_book_quantity()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status in ('returned', 'lost') and old.status = 'active' then
    update public.books
    set quantity = quantity + 1
    where id = new.book_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_rental_status_change on public.rentals;
create trigger on_rental_status_change
  after update of status on public.rentals
  for each row execute function public.restore_book_quantity();


-- ============================================================
-- TABLE 5: payments
-- ============================================================
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  rental_id   uuid not null references public.rentals(id) on delete restrict,
  amount      integer not null check (amount > 0),
  type        text not null check (type in ('rent_fee', 'deposit', 'late_fee', 'renewal', 'deposit_refund')),
  gateway     text not null check (gateway in ('esewa', 'khalti', 'cash')),
  status      text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  reference   text,
  created_at  timestamptz not null default now()
);

create index if not exists payments_rental_idx on public.payments(rental_id);
create index if not exists payments_status_idx on public.payments(status);


-- ============================================================
-- TABLE 6: wishlists
-- ============================================================
create table if not exists public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  book_id     uuid not null references public.books(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, book_id)
);

create index if not exists wishlists_user_idx on public.wishlists(user_id);
create index if not exists wishlists_book_idx on public.wishlists(book_id);


-- ============================================================
-- TABLE 7: sell_announcements
-- ============================================================
create table if not exists public.sell_announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  author       text not null,
  edition      text,
  price_range  text not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);


-- ============================================================
-- TABLE 8: sell_requests
-- ============================================================
create table if not exists public.sell_requests (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete restrict,
  announcement_id  uuid not null references public.sell_announcements(id) on delete restrict,
  condition        text not null check (condition in ('new', 'good', 'acceptable')),
  notes            text,
  photo_url        text,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_response   text,
  created_at       timestamptz not null default now()
);

create index if not exists sell_requests_user_idx   on public.sell_requests(user_id);
create index if not exists sell_requests_status_idx on public.sell_requests(status);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users              enable row level security;
alter table public.books              enable row level security;
alter table public.rentals            enable row level security;
alter table public.payments           enable row level security;
alter table public.pickup_locations   enable row level security;
alter table public.wishlists          enable row level security;
alter table public.sell_announcements enable row level security;
alter table public.sell_requests      enable row level security;


-- ── users ────────────────────────────────────────────────────
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id or is_admin());

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any user"
  on public.users for update
  using (is_admin());

create policy "Admins can view all users"
  on public.users for select
  using (is_admin());


-- ── books ────────────────────────────────────────────────────
create policy "Anyone can view active books"
  on public.books for select
  using (is_active = true or is_admin());

create policy "Admins can insert books"
  on public.books for insert
  with check (is_admin());

create policy "Admins can update books"
  on public.books for update
  using (is_admin());

create policy "Admins can delete books"
  on public.books for delete
  using (is_admin());


-- ── pickup_locations ─────────────────────────────────────────
create policy "Anyone can view active locations"
  on public.pickup_locations for select
  using (is_active = true or is_admin());

create policy "Admins can manage locations"
  on public.pickup_locations for all
  using (is_admin());


-- ── rentals ──────────────────────────────────────────────────
create policy "Users can view own rentals"
  on public.rentals for select
  using (auth.uid() = user_id or is_admin());

create policy "Users can create own rentals"
  on public.rentals for insert
  with check (auth.uid() = user_id);

create policy "Admins can update rentals"
  on public.rentals for update
  using (is_admin());


-- ── payments ─────────────────────────────────────────────────
create policy "Users can view own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.rentals r
      where r.id = rental_id and r.user_id = auth.uid()
    )
    or is_admin()
  );

create policy "Users can insert own payments"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.rentals r
      where r.id = rental_id and r.user_id = auth.uid()
    )
  );

create policy "Admins can manage payments"
  on public.payments for all
  using (is_admin());


-- ── wishlists ────────────────────────────────────────────────
create policy "Users can manage own wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view all wishlists"
  on public.wishlists for select
  using (is_admin());


-- ── sell_announcements ───────────────────────────────────────
create policy "Anyone can view active announcements"
  on public.sell_announcements for select
  using (is_active = true or is_admin());

create policy "Admins can manage announcements"
  on public.sell_announcements for all
  using (is_admin());


-- ── sell_requests ────────────────────────────────────────────
create policy "Users can view own sell requests"
  on public.sell_requests for select
  using (auth.uid() = user_id or is_admin());

create policy "Users can create sell requests"
  on public.sell_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins can update sell requests"
  on public.sell_requests for update
  using (is_admin());


-- ============================================================
-- SEED: Sample pickup locations (edit as needed)
-- ============================================================
insert into public.pickup_locations (name, type, district, address, contact) values
  ('Kathmandu Public Library', 'library', 'Kathmandu', 'Bagh Bazaar, Kathmandu', '01-4411111'),
  ('The Reading Room Cafe', 'cafe', 'Kathmandu', 'Thamel, Kathmandu', '98XXXXXXXX'),
  ('Bhaktapur Community Library', 'library', 'Bhaktapur', 'Durbar Square, Bhaktapur', '01-6610000'),
  ('Patan Library', 'library', 'Lalitpur', 'Mangal Bazaar, Lalitpur', '01-5522222'),
  ('Book & Brew Cafe', 'cafe', 'Lalitpur', 'Kupondole, Lalitpur', '98XXXXXXXX')
on conflict do nothing;
