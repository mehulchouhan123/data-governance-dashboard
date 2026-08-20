class DataClassificationOverrideService
  def self.call(dataset_column, sensitivity_tag)
    new(dataset_column, sensitivity_tag).call
  end

  def initialize(dataset_column, sensitivity_tag)
    @dataset_column = dataset_column
    @sensitivity_tag = sensitivity_tag.to_s.upcase
  end

  def call
    validate_classification!

    dataset_column.update!(
      sensitivity_tag: sensitivity_tag,
      classification_source: "MANUAL"
    )

    dataset_column
  end

  private

  attr_reader :dataset_column, :sensitivity_tag

  def validate_classification!
    unless DatasetColumn::CLASSIFICATION_LEVELS.include?(sensitivity_tag)
      raise ArgumentError,
            "Invalid classification level. " \
            "Allowed values: #{DatasetColumn::CLASSIFICATION_LEVELS.join(', ')}"
    end
  end
end