class DataTypeInferenceService
  TYPES = %w[
    boolean
    integer
    float
    date
    datetime
    string
  ].freeze

  def self.call(values)
    new(values).call
  end

  def initialize(values)
    @values = values
  end

  def call
    values = normalized_values

    return "string" if values.empty?

    if values.all? { |value| boolean?(value) }
      "boolean"
    elsif values.all? { |value| integer?(value) }
      "integer"
    elsif values.all? { |value| float?(value) }
      "float"
    elsif values.all? { |value| date?(value) }
      "date"
    else
      "string"
    end
  end

  private

  attr_reader :values

  def normalized_values
    @values
      .compact
      .map { |value| value.to_s.strip }
      .reject(&:empty?)
  end

  def boolean?(value)
    %w[true false].include?(value.downcase)
  end

  def integer?(value)
    Integer(value)
    true
  rescue ArgumentError
    false
  end

  def float?(value)
    Float(value)
    true
  rescue ArgumentError
    false
  end

  def date?(value)
    Date.parse(value)
    true
  rescue ArgumentError
    false
  end
end