class DatasetDiscoveryService
  def self.call(dataset, parsed_data)
    new(dataset, parsed_data).call
  end

  def initialize(dataset, parsed_data)
    @dataset = dataset
    @parsed_data = parsed_data
  end

  def call
    create_columns
  end

  private

  attr_reader :dataset, :parsed_data

  def create_columns
    headers = parsed_data[:headers]
    rows = parsed_data[:rows]

    headers.each_with_index.map do |header, index|
      values = rows.map { |row| row[index] }

      dataset.dataset_columns.create!(
        name: header.to_s.strip,
        data_type: DataTypeInferenceService.call(values),
        position: index
      )
    end
  end
end