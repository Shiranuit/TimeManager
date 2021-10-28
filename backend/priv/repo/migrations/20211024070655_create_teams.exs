defmodule Gotham.Repo.Migrations.CreateTeams do
  use Ecto.Migration

  def change do
    create table(:teams) do
      add :team_name, :string, unique: true, null: false

      timestamps()
    end
    create unique_index(:teams, [:team_name])
  end
end
