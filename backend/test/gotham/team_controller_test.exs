defmodule Gotham.TeamControllerTest do
  use Gotham.DataCase

  alias Gotham.TeamController

  describe "teams" do
    alias Gotham.TeamController.Team

    import Gotham.TeamControllerFixtures

    @invalid_attrs %{team_name: nil}

    test "list_teams/0 returns all teams" do
      team = team_fixture()
      assert TeamController.list_teams() == [team]
    end

    test "get_team!/1 returns the team with given id" do
      team = team_fixture()
      assert TeamController.get_team!(team.id) == team
    end

    test "create_team/1 with valid data creates a team" do
      valid_attrs = %{team_name: "some team_name"}

      assert {:ok, %Team{} = team} = TeamController.create_team(valid_attrs)
      assert team.team_name == "some team_name"
    end

    test "create_team/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = TeamController.create_team(@invalid_attrs)
    end

    test "update_team/2 with valid data updates the team" do
      team = team_fixture()
      update_attrs = %{team_name: "some updated team_name"}

      assert {:ok, %Team{} = team} = TeamController.update_team(team, update_attrs)
      assert team.team_name == "some updated team_name"
    end

    test "update_team/2 with invalid data returns error changeset" do
      team = team_fixture()
      assert {:error, %Ecto.Changeset{}} = TeamController.update_team(team, @invalid_attrs)
      assert team == TeamController.get_team!(team.id)
    end

    test "delete_team/1 deletes the team" do
      team = team_fixture()
      assert {:ok, %Team{}} = TeamController.delete_team(team)
      assert_raise Ecto.NoResultsError, fn -> TeamController.get_team!(team.id) end
    end

    test "change_team/1 returns a team changeset" do
      team = team_fixture()
      assert %Ecto.Changeset{} = TeamController.change_team(team)
    end
  end
end
