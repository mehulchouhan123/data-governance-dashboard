import { useState } from "react";
import { uploadDataset } from "../api/datasets";

function DatasetUpload() {
  const [file, setFile] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setError(null);

      const response = await uploadDataset(file);

      setDataset(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error || "Upload failed"
      );
    }
  };

  return (
    <div>
      <h2>Upload Dataset</h2>

      <input
        type="file"
        // accept=".csv,.xlsx"
        onChange={(event) => setFile(event.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload
      </button>

      {error && <p>{error}</p>}

      {dataset && (
        <div>
          <h3>Upload Successful</h3>

          <p>Filename: {dataset.filename}</p>
          <p>Rows: {dataset.row_count}</p>
          <p>Columns: {dataset.column_count}</p>
        </div>
      )}
    </div>
  );
}

export default DatasetUpload;