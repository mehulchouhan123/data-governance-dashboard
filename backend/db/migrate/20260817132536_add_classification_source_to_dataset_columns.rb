class AddClassificationSourceToDatasetColumns < ActiveRecord::Migration[8.1]
  def change
    add_column :dataset_columns, :classification_source, :string
  end
end
