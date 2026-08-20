class CreateDatasets < ActiveRecord::Migration[8.0]
  def change
    create_table :datasets do |t|
      t.string :filename, null: false
      t.string :file_type, null: false
      t.datetime :uploaded_at, null: false
      t.integer :row_count, null: false, default: 0
      t.integer :column_count, null: false, default: 0

      t.timestamps
    end
  end
end