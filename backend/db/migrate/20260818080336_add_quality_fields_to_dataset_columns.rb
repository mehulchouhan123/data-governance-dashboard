class AddQualityFieldsToDatasetColumns < ActiveRecord::Migration[8.0]
  def change
    add_column :dataset_columns, :missing_count, :integer, default: 0, null: false
    add_column :dataset_columns, :missing_percentage, :float, default: 0.0, null: false
    add_column :dataset_columns, :invalid_count, :integer, default: 0, null: false
  end
end