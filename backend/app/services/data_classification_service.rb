class DataClassificationService
  def self.call(dataset)
    new(dataset).call
  end

  def initialize(dataset)
    @dataset = dataset
  end
  CLASSIFICATION_RULES = {
    "RESTRICTED" => [
      /\bpassword\b/i,
      /\bpasswd\b/i,
      /\bsecret\b/i,
      /\bapi[_ ]?key\b/i,
      /\baccess[_ ]?token\b/i,
      /\bauth[_ ]?token\b/i,
      /\bcredit[_ ]?card\b/i,
      /\bcard[_ ]?number\b/i,
      /\bbank[_ ]?account\b/i,
      /\baccount[_ ]?number\b/i,
      /\bssn\b/i,
      /\bsocial[_ ]?security\b/i,
      /\bprivate[_ ]?key\b/i
    ],

    "CONFIDENTIAL" => [
      /\bemail\b/i,
      /\be[-_ ]?mail\b/i,
      /\bphone\b/i,
      /\bmobile\b/i,
      /\btelephone\b/i,
      /\baddress\b/i,
      /\bzip\b/i,
      /\bpostal\b/i,
      /\bpostcode\b/i,
      /\bdob\b/i,
      /\bdate[_ ]?of[_ ]?birth\b/i,
      /\bbirth\b/i,
      /\bemployee\b/i,
      /\bcustomer\b/i,
      /\bpersonal\b/i
    ],

    "INTERNAL" => [
      /\bid\b/i,
      /\bstore[_ ]?id\b/i,
      /\bemployee[_ ]?id\b/i,
      /\bcustomer[_ ]?id\b/i,
      /\bentity\b/i,
      /\boutlet\b/i,
      /\binternal\b/i,
      /\bdepartment\b/i,
      /\bbranch\b/i
    ],

    "PUBLIC" => [
      /\bcity\b/i,
      /\bstate\b/i,
      /\bcounty\b/i,
      /\bcountry\b/i,
      /\bregion\b/i,
      /\bpublic\b/i
    ]
  }.freeze

  DEFAULT_CLASSIFICATION = "INTERNAL"

  def initialize(dataset)
    @dataset = dataset
  end

  def call
    @dataset.dataset_columns.find_each do |column|
      classification = classify_column(column.name)

      column.update!(
        sensitivity_tag: classification,
        classification_source: "RULE"
      )
    end

    @dataset
  end

  private

  def classify_column(column_name)
    normalized_name = column_name.to_s.strip

    CLASSIFICATION_RULES.each do |classification, patterns|
      return classification if patterns.any? do |pattern|
        normalized_name.match?(pattern)
      end
    end

    DEFAULT_CLASSIFICATION
  end
end