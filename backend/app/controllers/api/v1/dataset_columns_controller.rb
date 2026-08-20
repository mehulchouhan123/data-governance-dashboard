module Api
  module V1
    class DatasetColumnsController < ApplicationController
      def update
        dataset = Dataset.find(params[:dataset_id])
        column = dataset.dataset_columns.find(params[:id])

        DataClassificationOverrideService.call(
          column,
          params[:sensitivity_tag]
        )

        render json: serialize_column(column)
      rescue ActiveRecord::RecordNotFound
        render json: {
          error: "Dataset or column not found"
        }, status: :not_found
      rescue ArgumentError => e
        render json: {
          error: e.message
        }, status: :unprocessable_entity
      end

      private

      def serialize_column(column)
        {
          id: column.id,
          name: column.name,
          data_type: column.data_type,
          position: column.position,
          sensitivity_tag: column.sensitivity_tag,
          classification_source: column.classification_source
        }
      end
    end
  end
end