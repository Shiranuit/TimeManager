CREATE OR REPLACE FUNCTION public.list_user_teams(
  IN userId INTEGER
)
RETURNS TABLE (teams TEXT[]) AS $$
DECLARE
  owned TEXT[];
  members TEXT[];
BEGIN
  owned := array_agg(T.name) FROM teams AS T WHERE T.owner_id = userId;
  members := array_agg(T.name) FROM teams_members AS T WHERE T.user_id = userId;
  RETURN QUERY
    SELECT array_unique(array_cat(owned,members));
END;
$$ LANGUAGE plpgsql;