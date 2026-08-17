import { useEffect, useState } from "react";
import { getDatasets } from "../api/datasets";
import DatasetUpload from "./DatasetUpload";

function DatasetDiscoveryDashboard() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      setLoading(true);
      setError(null);

      const response = await getDatasets();

      setDatasets(response.data);
    } catch (error) {
      console.error(error);
      setError("Unable to load datasets.");
    } finally {
      setLoading(false);
    }
  }

  function handleUploadSuccess(newDataset) {
    setDatasets((currentDatasets) => [
      newDataset,
      ...currentDatasets,
    ]);
  }

  return (
    <div>
      <h1>Data Discovery Dashboard</h1>

      <DatasetUpload
        onUploadSuccess={handleUploadSuccess}
      />

      <hr />

      <h2>Uploaded Datasets</h2>

      {loading && (
        <p>Loading datasets...</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {!loading && datasets.length === 0 && (
        <p>No datasets uploaded yet.</p>
      )}

      {datasets.map((dataset) => (
        <DatasetDiscoveryCard
          key={dataset.id}
          dataset={dataset}
        />
      ))}
    </div>
  );
}

function DatasetDiscoveryCard({ dataset }) {
  return (
    <div>
      <hr />

      <h2>{dataset.filename}</h2>

      <p>
        File Type: {dataset.file_type.toUpperCase()}
      </p>

      <p>
        Uploaded:{" "}
        {new Date(dataset.uploaded_at).toLocaleString()}
      </p>

      <p>
        <strong>{dataset.row_count}</strong> Rows
      </p>

      <p>
        <strong>{dataset.column_count}</strong> Columns
      </p>

      <h3>Discovered Columns</h3>

      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Column Name</th>
            <th>Data Type</th>
            <th>Missing Values</th>
          </tr>
        </thead>

        <tbody>
          {dataset.columns.map((column) => (
            <tr key={column.id}>
              <td>{column.position + 1}</td>
              <td>{column.name}</td>
              <td>{column.data_type}</td>
              <td>{column.missing_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DatasetDiscoveryDashboard;