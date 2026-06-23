alter table public.push_tokens
  add constraint push_tokens_utilizator_token_key unique (utilizator_id, expo_push_token);
