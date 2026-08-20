class DatasetFileParser
   def self.call(file)
    new(file).call
  end

  def initialize(file)
    @file = file
  end

  def call
    case file_extension
    when ".csv"
      parse_csv
    when ".xlsx"
      parse_xlsx
    else
      raise ArgumentError, "Unsupported file type"
    end
  end

  private

  attr_reader :file

  def file_extension
    File.extname(file.original_filename).downcase
  end

  def parse_csv
    rows = CSV.read(file.tempfile, headers: true)
    headers = rows.headers

    {
      headers: headers,
      rows: rows.map(&:fields),
      row_count: rows.length,
      column_count: headers.length
    }
  end


  def parse_xlsx
    spreadsheet = Roo::Excelx.new(file.tempfile.path)

    sheet = spreadsheet.sheet(0)

    headers = sheet.row(1)
    data_rows = []
    ((2)..sheet.last_row).each do |row_number|
      data_rows << sheet.row(row_number)
    end

    {
      headers: headers,
      rows: data_rows,
      row_count: data_rows.length,
      column_count: headers.length
    }
  end
end