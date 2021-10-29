defmodule GothamWeb.UserView do
  use GothamWeb, :view
  alias GothamWeb.UserView

  def render("show_list.json", %{users: users}) do
    %{result: render_many(users, UserView, "user.json")}
  end

  def render("show.json", %{user: user}) do
    %{result: render_one(user, UserView, "user.json")}
  end

  def render("user.json", %{user: user}) do
    %{
      id: user.id,
      username: user.username,
      email: user.email
    }
  end
end
