class AddQualityFieldsToDatasets < ActiveRecord::Migration[8.0]
  def change
    add_column :datasets, :quality_score, :float
    add_column :datasets, :duplicate_row_count, :integer, default: 0, null: false
    add_column :datasets, :invalid_value_count, :integer, default: 0, null: false
  end
end