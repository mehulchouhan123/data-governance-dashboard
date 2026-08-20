class Dataset < ApplicationRecord
  has_one_attached :file
  has_many :dataset_columns, dependent: :destroy
  
  validates :filename, presence: true
  validates :file_type, presence: true
  validates :uploaded_at, presence: true

  validates :row_count,
            numericality: { greater_than_or_equal_to: 0 }

  validates :column_count,
            numericality: { greater_than_or_equal_to: 0 }
end
