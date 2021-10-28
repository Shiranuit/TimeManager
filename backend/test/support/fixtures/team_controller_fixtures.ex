defmodule Gotham.TeamControllerFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Gotham.TeamController` context.
  """

  @doc """
  Generate a team.
  """
  def team_fixture(attrs \\ %{}) do
    {:ok, team} =
      attrs
      |> Enum.into(%{
        team_name: "some team_name"
      })
      |> Gotham.TeamController.create_team()

    team
  end
end
