-- seed.sql

-- 1. Habilitar extensão pgcrypto (necessária para gerar senhas no Supabase via SQL)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Liberar o domínio @zoom.education para cadastro
INSERT INTO allowed_domains (domain, is_active) 
VALUES ('zoom.education', true)
ON CONFLICT (domain) DO NOTHING;

-- 3. Criar usuário Admin na tabela de autenticação
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a325d742-b883-49d6-8488-825501fb1cf0',
  'authenticated',
  'authenticated',
  'admin@zoom.education',
  crypt('admin123', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Administrador ZOOM"}',
  current_timestamp,
  current_timestamp
) ON CONFLICT (id) DO NOTHING;

-- 4. Inserir identidade de autenticação para o usuário
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
) VALUES (
  'a325d742-b883-49d6-8488-825501fb1cf0',
  'a325d742-b883-49d6-8488-825501fb1cf0',
  format('{"sub":"%s","email":"%s"}', 'a325d742-b883-49d6-8488-825501fb1cf0', 'admin@zoom.education')::jsonb,
  'email',
  current_timestamp,
  current_timestamp
) ON CONFLICT (provider, id) DO NOTHING;

-- 5. O trigger (on_auth_user_created) que configuramos no schema já vai criar o profile automaticamente ao executar o INSERT acima.
-- Vamos apenas atualizar a role desse profile para que ele seja um "admin" com acesso total.
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@zoom.education';
