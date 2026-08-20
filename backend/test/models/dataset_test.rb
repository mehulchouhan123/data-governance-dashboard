require "test_helper"

class DatasetTest < ActiveSupport::TestCase

  test "dataset can be created with valid attributes" do
    dataset = Dataset.new(
      filename: "customers.xlsx",
      file_type: ".xlsx",
      uploaded_at: Time.current,
      row_count: 10,
      column_count: 5
    )

    assert dataset.valid?
  end

  test "dataset has many dataset columns" do
    dataset = Dataset.create!(
      filename: "customers.xlsx",
      file_type: ".xlsx",
      uploaded_at: Time.current,
      row_count: 10,
      column_count: 5
    )

    dataset.dataset_columns.create!(
      name: "Customer Name",
      data_type: "string",
      position: 0
    )

    assert_equal 1, dataset.dataset_columns.count
  end

end