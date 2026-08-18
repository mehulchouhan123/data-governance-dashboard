import { useEffect, useState } from "react";
import {
  getDatasets,
  updateDatasetColumnClassification,
} from "../api/datasets";
import DatasetUpload from "./DatasetUpload";

const CLASSIFICATION_LEVELS = [
  "PUBLIC",
  "INTERNAL",
  "CONFIDENTIAL",
  "RESTRICTED",
];

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
        <p style={{ color: "red" }}>
          {error}
        </p>
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
  /*
   * Keep a local copy of columns so that
   * the UI can update immediately after
   * a manual classification change.
   */
  const [columns, setColumns] = useState(
    dataset.columns || []
  );

  const [updatingColumnId, setUpdatingColumnId] =
    useState(null);

  const [error, setError] = useState(null);

  /*
   * Manual classification override
   */
  async function handleClassificationChange(
    columnId,
    newTag
  ) {
    try {
      setUpdatingColumnId(columnId);
      setError(null);

      const response =
        await updateDatasetColumnClassification(
          dataset.id,
          columnId,
          newTag
        );

      /*
       * Backend returns the updated column.
       */
      const updatedColumn = response.data;

      /*
       * Replace only the changed column.
       */
      setColumns((currentColumns) =>
        currentColumns.map((column) =>
          column.id === columnId
            ? updatedColumn
            : column
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update the classification."
      );
    } finally {
      setUpdatingColumnId(null);
    }
  }

  return (
    <div>
      <hr />

      <h2>{dataset.filename}</h2>

      <p>
        File Type:{" "}
        {dataset.file_type.toUpperCase()}
      </p>

      <p>
        Uploaded:{" "}
        {new Date(
          dataset.uploaded_at
        ).toLocaleString()}
      </p>

      <p>
        <strong>
          {dataset.row_count}
        </strong>{" "}
        Rows
      </p>

      <p>
        <strong>
          {dataset.column_count}
        </strong>{" "}
        Columns
      </p>

      <h3>
        Discovered & Classified Columns
      </h3>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Column Name</th>
            <th>Data Type</th>
            <th>Sensitivity Tag</th>
            <th>Classification Source</th>
            <th>Override</th>
          </tr>
        </thead>

        <tbody>
          {columns.map((column) => (
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
                <ClassificationBadge
                  tag={
                    column.sensitivity_tag
                  }
                />
              </td>

              <td>
                <ClassificationSource
                  source={
                    column.classification_source
                  }
                />
              </td>

              <td>
                <select
                  value={
                    column.sensitivity_tag || ""
                  }
                  disabled={
                    updatingColumnId ===
                    column.id
                  }
                  onChange={(event) =>
                    handleClassificationChange(
                      column.id,
                      event.target.value
                    )
                  }
                >
                  <option
                    value=""
                    disabled
                  >
                    Select tag
                  </option>

                  {CLASSIFICATION_LEVELS.map(
                    (level) => (
                      <option
                        key={level}
                        value={level}
                      >
                        {level}
                      </option>
                    )
                  )}
                </select>

                {updatingColumnId ===
                  column.id && (
                  <span>
                    {" "}
                    Updating...
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/*
 * Sensitivity tag UI
 */
function ClassificationBadge({ tag }) {
  if (!tag) {
    return (
      <span>
        UNCLASSIFIED
      </span>
    );
  }

  const colors =
    getClassificationColors(tag);

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor:
          colors.background,
        color: colors.text,
      }}
    >
      {tag}
    </span>
  );
}

/*
 * AUTO / MANUAL source UI
 */
function ClassificationSource({ source }) {
  if (!source) {
    return <span>-</span>;
  }

  const normalizedSource =
    source.toUpperCase();

  const isManual =
    normalizedSource === "MANUAL";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: isManual
          ? "#ede9fe"
          : "#e0f2fe",
        color: isManual
          ? "#6d28d9"
          : "#0369a1",
      }}
    >
      {isManual ? "MANUAL" : "AUTO"}
    </span>
  );
}

/*
 * Colors for each sensitivity level
 */
function getClassificationColors(tag) {
  switch (tag) {
    case "PUBLIC":
      return {
        background: "#dcfce7",
        text: "#166534",
      };

    case "INTERNAL":
      return {
        background: "#dbeafe",
        text: "#1e40af",
      };

    case "CONFIDENTIAL":
      return {
        background: "#fef3c7",
        text: "#92400e",
      };

    case "RESTRICTED":
      return {
        background: "#fee2e2",
        text: "#991b1b",
      };

    default:
      return {
        background: "#e5e7eb",
        text: "#374151",
      };
  }
}

export default DatasetDiscoveryDashboard;