defmodule GothamWeb.TeamController do
  use GothamWeb, :controller

  alias Gotham.TeamController
  alias Gotham.UserController
  alias Gotham.TeamController.Team

  action_fallback GothamWeb.FallbackController

  def list_team(conn, _params) do
    teams = TeamController.list_teams()
    render(conn, "index.json", teams: teams)
  end

  def create_team(conn, %{"team" => team_params}) do
    with {:ok, %Team{} = team} <- TeamController.create_team(team_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.team_path(conn, :show, team))
      |> render("show.json", team: team)
    end
  end

  def get_team(conn, %{"teamID" => teamID}) do
    team = TeamController.get_team!(teamID)
    render(conn, "show.json", team: team)
  end

  def update_team(conn, %{"teamID" => teamID, "team" => team_params}) do
    team = TeamController.get_team!(teamID)

    with {:ok, %Team{} = team} <- TeamController.update_team(team, team_params) do
      render(conn, "show.json", team: team)
    end
  end

  def delete_team(conn, %{"teamID" => teamID}) do
    team = TeamController.get_team!(teamID)

    with {:ok, %Team{}} <- TeamController.delete_team(team) do
      send_resp(conn, :no_content, "")
    end
  end

  def add_user_to_team(conn, %{"userID" => userID, "teamID" => teamID}) do
    user = UserController.get_user!(userID)
    team = TeamController.get_team!(teamID)

    with {:ok, %Team{} = team} <- TeamController.add_user_to_team(team, user) do
      render(conn, "show.json", team: team)
    end
  end

  def delete_team_from_user(conn, %{"userID" => userID}) do
    user = UserController.get_user!(userID)

    with {:ok, %Team{}} <- TeamController.delete_team_from_user(user) do
      send_resp(conn, :no_content, "")
    end
  end

  def get_user_team(conn, %{"userID" => userID}) do
    user = UserController.get_user!(userID)

    with {:ok, %Team{} = team} <- TeamController.get_user_team(user) do
      render(conn, "show.json", team: team)
    end
  end


end
