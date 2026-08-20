require "test_helper"

class DatasetColumnTest < ActiveSupport::TestCase

  test "dataset column belongs to dataset" do
    dataset = Dataset.create!(
      filename: "test.xlsx",
      file_type: ".xlsx",
      uploaded_at: Time.current,
      row_count: 2,
      column_count: 1
    )

    column = dataset.dataset_columns.create!(
      name: "Email",
      data_type: "string",
      position: 0
    )

    assert_equal dataset.id, column.dataset_id
  end

  test "dataset column can store sensitivity classification" do
    dataset = Dataset.create!(
      filename: "test.xlsx",
      file_type: ".xlsx",
      uploaded_at: Time.current,
      row_count: 2,
      column_count: 1
    )

    column = dataset.dataset_columns.create!(
      name: "Email",
      data_type: "string",
      position: 0,
      sensitivity_tag: "CONFIDENTIAL",
      classification_source: "RULE"
    )

    assert_equal "CONFIDENTIAL", column.sensitivity_tag
    assert_equal "RULE", column.classification_source
  end

end