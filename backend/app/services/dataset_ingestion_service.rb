class DatasetIngestionService
  def self.call(file)
    new(file).call
  end

  def initialize(file)
    @file = file
  end

  def call
    validate_file!
    
    parsed_data = DatasetFileParser.call(file)

    Dataset.transaction do
      dataset = Dataset.create!(
        filename: file.original_filename,
        file_type: file_extension,
        uploaded_at: Time.current,
        row_count: parsed_data[:row_count],
        column_count: parsed_data[:column_count]
      )

      dataset.file.attach(file)

      DatasetDiscoveryService.call(dataset, parsed_data)

       # Phase 4: Data Classification
      DataClassificationService.call(dataset)

      # Phase 5: Data Classification
      DatasetQualityService.call(dataset, parsed_data)

      # Phase 6: Data Classification
      DatasetTrustService.call(dataset)

      dataset
    end
  end

  private

  attr_reader :file

  def validate_file!
    raise ArgumentError, "Unsupported file type" unless supported_file?
  end

  def supported_file?
    %w[.csv .xlsx].include?(file_extension)
  end

  def file_extension
    File.extname(file.original_filename).downcase
  end
end