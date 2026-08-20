# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_18_091919) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "dataset_columns", force: :cascade do |t|
    t.string "classification_source"
    t.datetime "created_at", null: false
    t.string "data_type", null: false
    t.bigint "dataset_id", null: false
    t.integer "invalid_count", default: 0, null: false
    t.integer "missing_count", default: 0, null: false
    t.float "missing_percentage", default: 0.0, null: false
    t.string "name", null: false
    t.integer "position", null: false
    t.string "sensitivity_tag"
    t.datetime "updated_at", null: false
    t.index ["dataset_id"], name: "index_dataset_columns_on_dataset_id"
  end

  create_table "datasets", force: :cascade do |t|
    t.float "accuracy_score"
    t.float "classification_score"
    t.integer "column_count", default: 0, null: false
    t.float "completeness_score"
    t.float "consistency_score"
    t.datetime "created_at", null: false
    t.integer "duplicate_row_count", default: 0, null: false
    t.string "file_type", null: false
    t.string "filename", null: false
    t.integer "invalid_value_count", default: 0, null: false
    t.float "quality_score"
    t.integer "row_count", default: 0, null: false
    t.float "trust_score"
    t.datetime "updated_at", null: false
    t.datetime "uploaded_at", null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "dataset_columns", "datasets"
end
