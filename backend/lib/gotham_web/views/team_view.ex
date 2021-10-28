defmodule GothamWeb.TeamView do
  use GothamWeb, :view
  alias GothamWeb.TeamView

  def render("index.json", %{teams: teams}) do
    %{result: render_many(teams, TeamView, "team.json")}
  end

  def render("show.json", %{team: team}) do
    %{result: render_one(team, TeamView, "team.json")}
  end

  def render("team.json", %{team: team}) do
    %{
      id: team.id,
      team_name: team.team_name
    }
  end
end
