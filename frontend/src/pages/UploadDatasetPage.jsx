import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadDataset } from "../api/datasets";

function UploadDatasetPage() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    const valid =
      fileName.endsWith(".csv") ||
      fileName.endsWith(".xlsx");

    if (!valid) {
      setFile(null);
      setError("Only CSV and XLSX files are supported.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response = await uploadDataset(file);

      const dataset = response.data;

      // Go directly to the newly uploaded dataset
      navigate(`/discovery/${dataset.id}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
        "Unable to upload dataset."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h1>Upload Dataset</h1>

      <p>
        Upload a CSV or Excel dataset to discover its structure.
      </p>

      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileChange}
      />

      {file && (
        <p>
          Selected file:
          {" "}
          <strong>{file.name}</strong>
        </p>
      )}

      {error && (
        <p>{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading
          ? "Uploading..."
          : "Upload Dataset"}
      </button>
    </div>
  );
}

export default UploadDatasetPage;