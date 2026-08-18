import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDataset } from "../api/datasets";

function DatasetDetailPage() {
  const { id } = useParams();

  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDataset();
  }, [id]);

  async function loadDataset() {
    try {
      const response = await getDataset(id);

      setDataset(response.data);
    } catch (error) {
      console.error(error);
      setError("Unable to load dataset.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Loading dataset...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!dataset) {
    return <p>Dataset not found.</p>;
  }

  return (
    <div>
      <Link to="/discovery">
        ← Back to Dataset Catalog
      </Link>

      <h1>{dataset.filename}</h1>

      <p>
        File Type:
        {" "}
        {dataset.file_type.toUpperCase()}
      </p>

      <p>
        Uploaded:
        {" "}
        {new Date(
          dataset.uploaded_at
        ).toLocaleString()}
      </p>

      <div>
        <strong>
          {dataset.row_count}
        </strong>
        {" "}
        Rows
      </div>

      <div>
        <strong>
          {dataset.column_count}
        </strong>
        {" "}
        Columns
      </div>

      <h2>Discovered Columns</h2>

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
              <td>
                {column.position + 1}
              </td>

              <td>
                {column.name}
              </td>

              <td>
                {column.data_type}
              </td>

              <td>
                {column.missing_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DatasetDetailPage;