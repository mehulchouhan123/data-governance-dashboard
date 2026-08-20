class DatasetQualityService
  def self.call(dataset, parsed_data)
    new(dataset, parsed_data).call
  end

  def initialize(dataset, parsed_data)
    @dataset = dataset
    @parsed_data = parsed_data
  end

  def call
    calculate_column_quality
    calculate_duplicates
    calculate_invalid_values
    calculate_quality_score

    dataset
  end

  private

  attr_reader :dataset, :parsed_data

  def rows
    parsed_data[:rows] || []
  end

  def headers
    parsed_data[:headers] || []
  end

  def calculate_column_quality
    dataset.dataset_columns.order(:position).each do |column|
      values = column_values(column)

      missing_count = values.count do |value|
        missing_value?(value)
      end

      missing_percentage =
        if dataset.row_count.to_i.zero?
          0.0
        else
          (missing_count.to_f / dataset.row_count) * 100
        end

      invalid_count = values.count do |value|
        invalid_value?(value, column.data_type)
      end

      column.update!(
        missing_count: missing_count,
        missing_percentage: missing_percentage.round(2),
        invalid_count: invalid_count
      )
    end
  end

  def column_values(column)
    rows.map do |row|
      row[column.position]
    end
  end

  def missing_value?(value)
    return true if value.nil?

    value.respond_to?(:strip) &&
      value.strip.empty?
  end

  def calculate_duplicates
    duplicate_count =
      rows.length - rows.uniq.length

    dataset.update!(
      duplicate_row_count: duplicate_count
    )
  end

  def calculate_invalid_values
    total_invalid_values =
      dataset.dataset_columns.sum(:invalid_count)

    dataset.update!(
      invalid_value_count: total_invalid_values
    )
  end

  def calculate_quality_score
    missing_score = calculate_missing_score
    duplicate_score = calculate_duplicate_score
    invalid_score = calculate_invalid_score

    quality_score =
      (
        missing_score +
        duplicate_score +
        invalid_score
      ) / 3.0

    dataset.update!(
      quality_score: quality_score.round(2)
    )
  end

  def calculate_missing_score
    return 100.0 if dataset.row_count.to_i.zero?

    total_cells =
      dataset.row_count *
      dataset.column_count

    return 100.0 if total_cells.zero?

    total_missing =
      dataset.dataset_columns.sum(:missing_count)

    score =
      100 -
      ((total_missing.to_f / total_cells) * 100)

    score.clamp(0, 100)
  end

  def calculate_duplicate_score
    return 100.0 if dataset.row_count.to_i.zero?

    duplicate_percentage =
      (
        dataset.duplicate_row_count.to_f /
        dataset.row_count
      ) * 100

    score = 100 - duplicate_percentage

    score.clamp(0, 100)
  end

  def calculate_invalid_score
    total_cells =
      dataset.row_count *
      dataset.column_count

    return 100.0 if total_cells.zero?

    invalid_percentage =
      (
        dataset.invalid_value_count.to_f /
        total_cells
      ) * 100

    score = 100 - invalid_percentage

    score.clamp(0, 100)
  end

  def invalid_value?(value, data_type)
    return false if missing_value?(value)

    case data_type
    when "integer"
      invalid_integer?(value)

    when "date"
      invalid_date?(value)

    else
      false
    end
  end

  def invalid_integer?(value)
    Integer(value)
    false
  rescue ArgumentError, TypeError
    true
  end

  def invalid_date?(value)
    Date.parse(value.to_s)
    false
  rescue ArgumentError, TypeError
    true
  end
end