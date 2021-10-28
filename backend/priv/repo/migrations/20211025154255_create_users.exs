defmodule Gotham.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :username, :string, unique: true, null: false
      add :email, :string, unique: true, null: false
      add :role, :integer, default: 0, null: false
      add :team, references(:teams, on_delete: :nothing)

      timestamps()
    end

    create index(:users, [:team])
    create unique_index(:users, [:email, :username])
  end
end
