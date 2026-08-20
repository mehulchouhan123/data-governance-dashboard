Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      "http://localhost:5173",
      "https://data-governance-dashboard-1-y90i.onrender.com"
    )

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head]
  end
end
