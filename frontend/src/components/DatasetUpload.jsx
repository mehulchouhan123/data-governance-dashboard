import { useState } from "react";
import { uploadDataset } from "../api/datasets";

function DatasetUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedDataset, setUploadedDataset] = useState(null);

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    setFile(selectedFile || null);
    setError(null);
    setUploadedDataset(null);
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setError("Please select a CSV or Excel file.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadedDataset(null);

      const response = await uploadDataset(file);

      /*
       * Dataset successfully created by Rails.
       */
      const newDataset = response.data;

      /*
       * Show successful upload information.
       */
      setUploadedDataset(newDataset);

      /*
       * IMPORTANT:
       * Send the newly created dataset to the parent
       * dashboard.
       *
       * The dashboard will then call GET /datasets
       * and refresh the catalog automatically.
       */
      if (onUploadSuccess) {
        await onUploadSuccess(newDataset);
      }

      /*
       * Clear selected file.
       */
      setFile(null);

    } catch (error) {
      console.error(
        "Dataset upload failed:",
        error
      );

      setError(
        error?.response?.data?.error ||
        "Unable to upload dataset."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h2>Upload Dataset</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <button
          type="submit"
          disabled={!file || uploading}
        >
          {uploading
            ? "Uploading..."
            : "Upload"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {uploadedDataset && (
        <div>
          <h3>Upload Successful</h3>

          <p>
            Filename:{" "}
            {uploadedDataset.filename}
          </p>

          <p>
            Rows:{" "}
            {uploadedDataset.row_count}
          </p>

          <p>
            Columns:{" "}
            {uploadedDataset.column_count}
          </p>
        </div>
      )}
    </div>
  );
}

export default DatasetUpload;