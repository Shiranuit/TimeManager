defmodule GothamWeb.WorkingTimeController do
  use GothamWeb, :controller

  alias Gotham.WorkingTimeController
  alias Gotham.WorkingTimeController.WorkingTime

  action_fallback GothamWeb.FallbackController

  def list_user_workingtimes(conn, %{"userID" => userID}) do
    workingtimes = WorkingTimeController.list_user_workingtimes(userID)
    render(conn, "show_list.json", working_times: workingtimes)
  end

  def create_workingtime(conn, %{"userID" => userID, "start" => start, "end" => stop}) do
    with {:ok, %WorkingTime{} = working_time} <- WorkingTimeController.create_working_time(userID, %{"start" => start, "end" => stop}) do
      json(conn, %{
        result: %{
          start: working_time.start,
          end: working_time.end,
          id: working_time.id
        }
      })
    end
  end

  def show_all(conn, %{"id" => userID, "start" => start, "end" => stop}) do
    try do
      working_times = WorkingTimeController.get_all_working_times!(userID, start, stop)
      render(conn, "show_list.json", working_times: working_times)
    rescue
      e in Ecto.Query.CastError -> json(conn, %{error: "Bad request"})
    end
  end

  def show_one(conn, %{"id" => id}) do
    try do
      working_time = WorkingTimeController.get_working_time!(id)
      render(conn, "show.json", working_time: working_time)
    rescue
      e in Ecto.Query.CastError -> json(conn, %{error: "Bad request"})
    end
  end

  def show_by_params(conn, attrs \\ %{}) do

    cond do
      Map.has_key?(attrs, "start") && Map.has_key?(attrs, "end") ->
          show_all(conn, attrs)
      Map.has_key?(attrs, "start") ->
        json(conn, %{error: "missing 'end' with 'start'"})
      Map.has_key?(attrs, "end") ->
        json(conn, %{error: "missing 'start' with 'end'"})
      true ->
        show_one(conn, attrs)
    end
  end

  def update_workingtime(conn, %{"id" => id, "working_time" => working_time_params}) do
    working_time = WorkingTimeController.get_working_time!(id)

    with {:ok, %WorkingTime{} = working_time} <- WorkingTimeController.update_working_time(working_time, working_time_params) do
      render(conn, "show.json", working_time: working_time)
    end
  end

  def delete_workingtime(conn, %{"id" => id}) do
    working_time = WorkingTimeController.get_working_time!(id)

    with {:ok, %WorkingTime{}} <- WorkingTimeController.delete_working_time(working_time) do
      send_resp(conn, :no_content, "")
    end
  end
end
