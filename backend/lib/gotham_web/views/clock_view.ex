defmodule GothamWeb.ClockView do
  use GothamWeb, :view
  alias GothamWeb.ClockView

  def render("show_list.json", %{clocks: clocks}) do
    %{result: render_many(clocks, ClockView, "clock.json")}
  end

  def render("show.json", %{clock: clock}) do
    %{result: render_one(clock, ClockView, "clock.json")}
  end

  def render("clock.json", %{clock: clock}) do
    %{
      id: clock.id,
      time: clock.time,
      status: clock.status
    }
  end
end
