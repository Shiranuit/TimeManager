defmodule GothamWeb.UserController do
  use GothamWeb, :controller

  alias Gotham.UserController
  alias Gotham.UserController.User

  action_fallback GothamWeb.FallbackController

  def sign_in(conn, %{"username" => username, "email" => email}) do
    try do
      with {:ok, %User{} = user} <- UserController.create_user(%{"username" => username, "email" => email}) do
        json(conn, %{
          result: %{
            email: user.email,
            username: user.username,
            id: user.id,
            role: user.role
          }
        })
      end
    rescue
      _ in Ecto.ConstraintError ->
        json(conn, %{"error" => "Email / Username already taken"})
    end
  end

  def get_user_info(conn, %{"userID" => userID}) do
    user = UserController.get_user!(userID)
    json(conn, %{
      result: %{
        email: user.email,
        username: user.username,
        id: user.id,
        role: user.role,
        team: user.team
      }
    })
  end

  def get_user_info_by_name(conn, %{"name" => name}) do
    user = UserController.get_user_by_name!(name)
    json(conn, %{
      result: %{
        email: user.email,
        username: user.username,
        id: user.id,
        role: user.role,
        team: user.team
      }
    })
  end

  def update_user_info(conn, %{"userID" => userID, "user" => user_params}) do
    user = UserController.get_user!(userID)

    user_params = Map.drop(user_params, ["role", "team"])
    with {:ok, %User{} = user} <- UserController.update_user(user, user_params) do
      get_user_info(conn, %{"userID" => user.id})
    end
  end

  def delete_user(conn, %{"userID" => userID}) do
    user = UserController.get_user!(userID)

    with {:ok, %User{}} <- UserController.delete_user(user) do
      json(conn, %{"result" => true})
    end
  end

  def set_user_role(conn, %{"userID" => userID, "role" => role}) do
    user = UserController.get_user!(userID)

    case Integer.parse(role) do
      {num, ""} ->
        with {:ok, %User{}} <- UserController.set_user_role(user, num) do
          get_user_info(conn, %{"userID" => user.id})
        end
      {_, _} ->
        json(conn, %{error: "Invalid role"})
      _ -> json(conn, %{error: "Invalid role"})
    end
  end
end
