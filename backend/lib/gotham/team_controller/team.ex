defmodule Gotham.TeamController.Team do
  use Ecto.Schema
  import Ecto.Changeset

  schema "teams" do
    field :team_name, :string
    field :user, :id

    timestamps()
  end

  @doc false
  def changeset(team, attrs) do
    team
    |> cast(attrs, [:team_name])
    |> validate_required([:team_name])
    |> unique_constraint([:team_name])
  end
end
