require "test_helper"

class DatasetQualityServiceTest < ActiveSupport::TestCase

  test "detects missing values" do
     file = Rack::Test::UploadedFile.new(
        Rails.root.join("test/fixtures/files/test_dataset.csv"),
        "text/csv"
      )

    dataset = DatasetIngestionService.call(file)

    dataset.reload

    assert_not_nil dataset
  end

  test "calculates completeness correctly" do
     file = Rack::Test::UploadedFile.new(
        Rails.root.join("test/fixtures/files/test_dataset.csv"),
        "text/csv"
      )

    dataset = DatasetIngestionService.call(file)
    parsed_data = DatasetFileParser.call(file)

    result =
      DatasetQualityService.call(dataset, parsed_data)
    assert_in_delta(
      93.33,
      result[:completeness_score],
      0.01
    )
  end


  test "counts duplicate rows" do
    file = Rack::Test::UploadedFile.new(
        Rails.root.join("test/fixtures/files/test_dataset.csv"),
        "text/csv"
      )

    dataset = DatasetIngestionService.call(file)
    parsed_data = DatasetFileParser.call(file)

    result =
      DatasetQualityService.call(dataset, parsed_data)
    assert_equal(
      1,
      result[:duplicate_row_count]
    )
  end  
end