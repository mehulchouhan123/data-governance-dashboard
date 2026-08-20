class DatasetColumn < ApplicationRecord
   CLASSIFICATION_LEVELS = %w[
    PUBLIC
    INTERNAL
    CONFIDENTIAL
    RESTRICTED
  ].freeze

  CLASSIFICATION_SOURCES = %w[
    RULE
    MANUAL
    AI
  ].freeze

  belongs_to :dataset

  validates :name, presence: true
  validates :data_type, presence: true

  validates :sensitivity_tag,
            inclusion: {
              in: CLASSIFICATION_LEVELS
            },
            allow_nil: true

  validates :classification_source,
            inclusion: {
              in: CLASSIFICATION_SOURCES
            },
            allow_nil: true
end