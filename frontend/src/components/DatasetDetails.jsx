import { useEffect, useState } from "react";
import { getDataset } from "../api/datasets";

function DatasetDetails({ datasetId }) {
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDataset() {
      try {
        const response = await getDataset(datasetId);

        setDataset(response.data);
      } catch (error) {
        setError("Unable to load dataset");
      }
    }

    loadDataset();
  }, [datasetId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!dataset) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{dataset.filename}</h2>

      <p>
        Rows: {dataset.row_count}
      </p>

      <p>
        Columns: {dataset.column_count}
      </p>

      <h3>Columns</h3>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Data Type</th>
          </tr>
        </thead>

        <tbody>
          {dataset.columns.map((column) => (
            <tr key={column.id}>
              <td>{column.name}</td>
              <td>{column.data_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DatasetDetails;