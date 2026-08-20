class CreateDatasetColumns < ActiveRecord::Migration[8.0]
  def change
    create_table :dataset_columns do |t|
      t.references :dataset, null: false, foreign_key: true
      t.string :name, null: false
      t.string :data_type, null: false
      t.integer :position, null: false

      t.timestamps
    end
  end
end