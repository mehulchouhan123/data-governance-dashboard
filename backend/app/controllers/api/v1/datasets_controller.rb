class Api::V1::DatasetsController < ApplicationController

  def index
    datasets = Dataset
      .includes(:dataset_columns)
      .order(created_at: :desc)

    render json: datasets.map { |dataset| dataset_discovery_json(dataset) }
  end

  def create
    file = params[:file]
    
    return render_error("File is required", :unprocessable_entity) unless file
    
    dataset = DatasetIngestionService.call(file)

    render json: dataset_discovery_json(dataset),
         status: :created
  rescue ArgumentError => e
    render_error(e.message, :unprocessable_entity)
  end


  def show
    dataset = Dataset
      .includes(:dataset_columns)
      .find(params[:id])

    render json: dataset_discovery_json(dataset)
  end

  private

  def render_error(message, status)
    render json: { error: message }, status: status
  end


   private

  def dataset_discovery_json(dataset)
    {
      id: dataset.id,
      filename: dataset.filename,
      file_type: dataset.file_type,
      uploaded_at: dataset.uploaded_at,
      row_count: dataset.row_count,
      column_count: dataset.column_count,
      quality_score: dataset.quality_score,
      duplicate_row_count: dataset.duplicate_row_count,
      invalid_value_count: dataset.invalid_value_count,
      completeness_score:dataset.completeness_score,
      accuracy_score: dataset.accuracy_score,
      consistency_score: dataset.consistency_score,
      classification_score: dataset.classification_score,
      trust_score: dataset.trust_score,


      columns: dataset.dataset_columns
        .order(:position)
        .map do |column|
          {
            id: column.id,
            name: column.name,
            data_type: column.data_type,
            position: column.position,
            sensitivity_tag: column.sensitivity_tag,
            classification_source: column.classification_source,
            missing_count: column.missing_count,
            missing_percentage: column.missing_percentage,
            invalid_count: column.invalid_count,
          }
        end
    }
  end
end
