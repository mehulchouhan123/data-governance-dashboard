class DatasetTrustService
  def self.call(dataset)
    new(dataset).call
  end

  def initialize(dataset)
    @dataset = dataset
  end

  def call
    completeness_score = calculate_completeness_score
    accuracy_score = calculate_accuracy_score
    consistency_score = calculate_consistency_score
    classification_score = calculate_classification_score

    trust_score = calculate_trust_score(
      completeness_score,
      accuracy_score,
      consistency_score,
      classification_score
    )

    dataset.update!(
      completeness_score: completeness_score,
      accuracy_score: accuracy_score,
      consistency_score: consistency_score,
      classification_score: classification_score,
      trust_score: trust_score
    )

    dataset
  end

  private

  attr_reader :dataset

  # ----------------------------------------
  # COMPLETENESS
  # ----------------------------------------

  def calculate_completeness_score
    total_cells =
      dataset.row_count.to_i *
      dataset.column_count.to_i

    return 100.0 if total_cells.zero?

    total_missing =
      dataset.dataset_columns.sum(:missing_count)

    missing_percentage =
      (
        total_missing.to_f /
        total_cells
      ) * 100

    score =
      100 - missing_percentage

    score.clamp(0, 100).round(2)
  end

  # ----------------------------------------
  # ACCURACY
  # ----------------------------------------

  def calculate_accuracy_score
    total_cells =
      dataset.row_count.to_i *
      dataset.column_count.to_i

    return 100.0 if total_cells.zero?

    invalid_values =
      dataset.invalid_value_count.to_i

    invalid_percentage =
      (
        invalid_values.to_f /
        total_cells
      ) * 100

    score =
      100 - invalid_percentage

    score.clamp(0, 100).round(2)
  end

  # ----------------------------------------
  # CONSISTENCY
  # ----------------------------------------

  def calculate_consistency_score
    total_rows =
      dataset.row_count.to_i

    return 100.0 if total_rows.zero?

    duplicate_rows =
      dataset.duplicate_row_count.to_i

    duplicate_percentage =
      (
        duplicate_rows.to_f /
        total_rows
      ) * 100

    score =
      100 - duplicate_percentage

    score.clamp(0, 100).round(2)
  end

  # ----------------------------------------
  # CLASSIFICATION
  # ----------------------------------------

  def calculate_classification_score
    total_columns =
      dataset.column_count.to_i

    return 100.0 if total_columns.zero?

    classified_columns =
      dataset.dataset_columns
        .where.not(sensitivity_tag: [nil, ""])
        .count

    score =
      (
        classified_columns.to_f /
        total_columns
      ) * 100

    score.clamp(0, 100).round(2)
  end

  # ----------------------------------------
  # TRUST SCORE
  # ----------------------------------------

  def calculate_trust_score(
    completeness_score,
    accuracy_score,
    consistency_score,
    classification_score
  )
    quality_score =
      dataset.quality_score.to_f

    score =
      (
        quality_score +
        completeness_score +
        accuracy_score +
        consistency_score +
        classification_score
      ) / 5.0

    score.clamp(0, 100).round(2)
  end
end