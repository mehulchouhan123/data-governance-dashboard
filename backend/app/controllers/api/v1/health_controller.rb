module Api
  module V1
    class HealthController < ApplicationController
      def show
        render json: {
          status: "ok",
          message: "Data Governance API is running"
        }
      end
    end
  end
end