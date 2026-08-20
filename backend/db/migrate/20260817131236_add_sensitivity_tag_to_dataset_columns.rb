class AddSensitivityTagToDatasetColumns < ActiveRecord::Migration[8.1]
  def change
    add_column :dataset_columns, :sensitivity_tag, :string
  end
end
