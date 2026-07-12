-- Kullanıcı uygulama erişimleri

alter table profiles
  add column if not exists email text,
  add column if not exists allowed_apps text[] not null default '{}',
  add column if not exists is_active boolean not null default true;

-- Mevcut kullanıcılar tüm uygulamalara erişsin (geriye uyumluluk)
update profiles
set allowed_apps = array[
  'is-takip',
  'firmalar',
  'conta-takip',
  'notlar',
  'adres-yazici',
  'e-alisveris',
  'teknik-resim'
]
where coalesce(cardinality(allowed_apps), 0) = 0;
