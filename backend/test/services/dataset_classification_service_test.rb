require "test_helper"

class DatasetClassificationServiceTest < ActiveSupport::TestCase

  test "classifies email column" do
    dataset = Dataset.create!(
      filename: "customers.csv",
      file_type: ".csv",
      uploaded_at: Time.current,
      row_count: 3,
      column_count: 1
    )

    column = dataset.dataset_columns.create!(
      name: "Email",
      data_type: "string",
      position: 0
    )

    DataClassificationService.call(dataset)

    column.reload

    assert_equal "CONFIDENTIAL",
                 column.sensitivity_tag

    assert_equal "RULE",
                 column.classification_source
  end

end