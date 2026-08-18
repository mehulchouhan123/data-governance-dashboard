import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDatasets } from "../api/datasets";

function DatasetCatalogPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      const response = await getDatasets();

      setDatasets(response.data);
    } catch (error) {
      console.error(error);
      setError("Unable to load datasets.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Loading datasets...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Data Discovery</h1>

      <p>
        Dataset Catalog
      </p>

      {datasets.length === 0 && (
        <p>
          No datasets uploaded yet.
        </p>
      )}

      {datasets.map((dataset) => (
        <div key={dataset.id}>
          <hr />

          <h2>
            {dataset.filename}
          </h2>

          <p>
            Type: {dataset.file_type.toUpperCase()}
          </p>

          <p>
            {dataset.row_count} Rows
          </p>

          <p>
            {dataset.column_count} Columns
          </p>

          <p>
            Uploaded:
            {" "}
            {new Date(
              dataset.uploaded_at
            ).toLocaleString()}
          </p>

          <Link
            to={`/discovery/${dataset.id}`}
          >
            View Dataset
          </Link>
        </div>
      ))}
    </div>
  );
}

export default DatasetCatalogPage;