require "test_helper"

class DatasetIngestionServiceTest < ActiveSupport::TestCase
  test "rejects unsupported file type" do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join("test/fixtures/files/invalid.txt"),
      "text/plain"
    )

    assert_raises(ArgumentError) do
      DatasetIngestionService.call(file)
    end
  end

  test "successfully ingests an xlsx file" do
     file = Rack::Test::UploadedFile.new(
      Rails.root.join("test/fixtures/files/test_dataset.xlsx"),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


    assert_difference("Dataset.count", 1) do
      DatasetIngestionService.call(file)
    end
  end

  test "successfully ingests a csv file" do
     file = Rack::Test::UploadedFile.new(
      Rails.root.join("test/fixtures/files/test_dataset.csv"),
      "text/csv"
    )

    assert_difference("Dataset.count", 1) do
      DatasetIngestionService.call(file)
    end
  end

  test "creates dataset columns during ingestion" do
     file = Rack::Test::UploadedFile.new(
      Rails.root.join("test/fixtures/files/test_dataset.csv"),
      "text/csv"
    )

    dataset = DatasetIngestionService.call(file)

    assert_equal 3, dataset.dataset_columns.count

    names = dataset.dataset_columns
      .order(:position)
      .pluck(:name)

    assert_equal(
      ["Name", "Email", "Age"],
      names
    )
  end

  test "dataset columns have correct positions" do
    file = Rack::Test::UploadedFile.new(
        Rails.root.join("test/fixtures/files/test_dataset.csv"),
        "text/csv"
      )

    dataset = DatasetIngestionService.call(file)

    positions = dataset.dataset_columns
      .order(:position)
      .pluck(:position)

    assert_equal [0, 1, 2], positions
  end
end