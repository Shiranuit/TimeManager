CREATE TABLE IF NOT EXISTS public.teams (
  name TEXT NOT NULL PRIMARY KEY,
  owner_id INTEGER,

  CONSTRAINT unique_team_name UNIQUE (name),
  CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES public.users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS public.teams_members (
  name TEXT NOT NULL,
  user_id INTEGER NOT NULL,

  CONSTRAINT fk_name FOREIGN KEY (name) REFERENCES public.teams (name)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);