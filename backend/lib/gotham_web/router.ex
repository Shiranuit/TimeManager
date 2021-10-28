defmodule GothamWeb.Router do
  use GothamWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api/users", GothamWeb do
    pipe_through [:api]

    get "/userByName/:name", UserController, :get_user_info_by_name
    get "/:userID", UserController, :get_user_info
    post "/", UserController, :sign_in
    put "/:userID", UserController, :update_user_info
    delete "/:userID", UserController, :delete_user
    put "/:userID/_setRole", UserController, :set_user_role
  end

  scope "/api/workingtimes", GothamWeb do
    pipe_through [:api]

    get "/:userID/_list", WorkingTimeController, :list_user_workingtimes
    get "/:id", WorkingTimeController, :show_by_params
    post "/:userID", WorkingTimeController, :create_workingtime
    put "/:id", WorkingTimeController, :update_workingtime
    delete "/:id", WorkingTimeController, :delete_workingtime
  end

  scope "/api/clocks", GothamWeb do
    pipe_through [:api]

    get "/:userID/_list", ClockController, :list_user_clocks
    get "/:userID/:clockID", ClockController, :get_user_clock
    post "/:userID", ClockController, :create_user_clock
    delete "/:userID/:clockID", ClockController, :delete_user_clock
    put "/:userID/:clockID", ClockController, :update_user_clock
  end

  scope "/api/teams", GothamWeb do
    pipe_through [:api]

    get "/team/list", TeamController, :list_team
    get "/:teamID", TeamController, :get_team
    post "/:teamID", TeamController, :create_team
    put "/:teamID", TeamController, :update_team
    delete "/:teamID", TeamController, :delete_team

    post "/:userID/:teamID", TeamController, :add_user_to_team
    delete "/:userID/_team", TeamController, :delete_team_from_user
    get "/:userID/_team", UserController, :get_user_team
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through [:fetch_session, :protect_from_forgery]
      live_dashboard "/dashboard", metrics: GothamWeb.Telemetry
    end
  end

  # Enables the Swoosh mailbox preview in development.
  #
  # Note that preview only shows emails that were sent by the same
  # node running the Phoenix server.
  if Mix.env() == :dev do
    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
