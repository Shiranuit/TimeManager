defmodule GothamWeb.WorkingTimeView do
  use GothamWeb, :view
  alias GothamWeb.WorkingTimeView

  def render("show_list.json", %{working_times: working_times}) do
    %{result: render_many(working_times, WorkingTimeView, "working_time.json")}
  end

  def render("show.json", %{working_time: working_time}) do
    %{result: render_one(working_time, WorkingTimeView, "working_time.json")}
  end

  def render("working_time.json", %{working_time: working_time}) do
    %{
      id: working_time.id,
      start: working_time.start,
      end: working_time.end
    }
  end
end
