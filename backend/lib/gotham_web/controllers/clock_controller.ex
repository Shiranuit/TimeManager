defmodule GothamWeb.ClockController do
  use GothamWeb, :controller

  alias Gotham.ClockController
  alias Gotham.ClockController.Clock
  alias Gotham.WorkingTimeController

  action_fallback GothamWeb.FallbackController

  def create_user_clock(conn, %{"userID" => userID}) do
    with {:ok, %Clock{} = clock} <- ClockController.create_clock(%{"user" => userID, "status" => true, "time" => DateTime.utc_now()}) do
      conn
      |> put_status(:created)
      |> render("show.json", clock: clock)
    end
  end

  def list_user_clocks(conn, %{"userID" => userID}) do
    clocks = ClockController.list_clocks_by_user_id!(userID)
    render(conn, "show_list.json", clocks: clocks)
  end

  def get_user_clock(conn, %{"userID" => userID, "clockID" => clockID}) do
    try do
      clock = ClockController.get_user_clock_by_id!(userID, clockID)
      render(conn, "show.json", clock: clock)
    rescue
      _ in Ecto.NoResultsError ->
        json(conn, %{error: "Cannot find a clock with id #{clockID} for user #{userID} "})
    end
  end

  def update_user_clock(conn, %{"userID" => userID, "clockID" => clockID, "status" => status}) do
    try do
      clock = ClockController.get_user_clock_by_id!(userID, clockID)
      time = clock.time

      time = cond do
        clock.status == true and status != "true" ->
          WorkingTimeController.create_working_time(userID, %{"start" => clock.time, "end" => DateTime.utc_now()})
          clock.time
        clock.status == false and status == "true" ->
          DateTime.utc_now()
        true -> clock.time
      end

      IO.puts("clock status #{clock.status} -> #{status}")

      with {:ok, %Clock{} = clock} <- ClockController.update_clock(clock, %{"status" => status, "time" => time}) do
        render(conn, "show.json", clock: clock)
      end
    rescue
      _ in Ecto.NoResultsError ->
        json(conn, %{error: "Cannot find a clock with id #{clockID} for user #{userID} "})
    end
  end

  def delete_user_clock(conn, %{"userID" => userID, "clockID" => clockID}) do
    try do
      clock = ClockController.get_user_clock_by_id!(userID, clockID)

      with {:ok, %Clock{}} <- ClockController.delete_clock(clock) do
        json(conn, %{result: true})
      end
    rescue
      _ in Ecto.NoResultsError ->
        json(conn, %{error: "Cannot find a clock with id #{clockID} for user #{userID} "})
    end
  end

end
