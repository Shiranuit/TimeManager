defmodule Gotham.UserController.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :email, :string
    field :username, :string
    field :role, :integer
    field :team, :id

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :email, :role, :team])
    |> validate_required([:username, :email])
    |> unique_constraint([:username, :email])
    |> validate_format(:email, ~r/^[A-z0-9_\-]+(\.[A-z0-9_\-]+)*@[A-z0-9_\-]+(\.[A-z0-9_\-]+)*\.[A-z0-9_\-]+$/)
  end
end
