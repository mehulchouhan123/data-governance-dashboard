require "test_helper"

class Api::V1::DatasetColumnsControllerTest < ActionDispatch::IntegrationTest

  test "user can manually override classification" do
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
      position: 0,
      sensitivity_tag: "CONFIDENTIAL",
      classification_source: "RULE"
    )

    patch "/api/v1/datasets/#{dataset.id}/dataset_columns/#{column.id}",
      params: {
        sensitivity_tag: "PUBLIC"
      }

    assert_response :success

    column.reload

    assert_equal "PUBLIC",
                 column.sensitivity_tag

    assert_equal "MANUAL",
                 column.classification_source
  end


  test "manual override changes only selected column" do
    dataset = Dataset.create!(
      filename: "customers.csv",
      file_type: ".csv",
      uploaded_at: Time.current,
      row_count: 3,
      column_count: 2
    )

    first_column = dataset.dataset_columns.create!(
      name: "Email",
      data_type: "string",
      position: 0,
      sensitivity_tag: "CONFIDENTIAL",
      classification_source: "RULE"
    )

    second_column = dataset.dataset_columns.create!(
      name: "Age",
      data_type: "integer",
      position: 1,
      sensitivity_tag: "PUBLIC",
      classification_source: "RULE"
    )

    patch "/api/v1/datasets/#{dataset.id}/dataset_columns/#{first_column.id}",
      params: {
        sensitivity_tag: "RESTRICTED"
      }

    assert_response :success

    first_column.reload
    second_column.reload

    assert_equal "RESTRICTED",
                first_column.sensitivity_tag

    assert_equal "MANUAL",
                first_column.classification_source

    assert_equal "PUBLIC",
                second_column.sensitivity_tag

    assert_equal "RULE",
                second_column.classification_source
  end


  test "returns datasets" do
    dataset = Dataset.create!(
      filename: "customers.xlsx",
      file_type: ".xlsx",
      uploaded_at: Time.current,
      row_count: 10,
      column_count: 3
    )

    get "/api/v1/datasets"

    assert_response :success

    body = JSON.parse(response.body)

    assert body.is_a?(Array)

    returned_dataset =
      body.find do |item|
        item["id"] == dataset.id
      end

    assert_not_nil returned_dataset

    assert_equal(
      "customers.xlsx",
      returned_dataset["filename"]
    )
  end

end