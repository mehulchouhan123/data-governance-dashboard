class AddTrustFieldsToDatasets < ActiveRecord::Migration[8.0]
  def change
    add_column :datasets, :completeness_score, :float
    add_column :datasets, :accuracy_score, :float
    add_column :datasets, :consistency_score, :float
    add_column :datasets, :classification_score, :float
    add_column :datasets, :trust_score, :float
  end
end