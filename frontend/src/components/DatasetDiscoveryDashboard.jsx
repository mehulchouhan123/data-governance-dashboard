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
      <h1>Data Discovery & Quality Dashboard</h1>

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
   * Local copy of columns.
   *
   * This allows the classification override
   * to update immediately without reloading
   * the complete dataset list.
   */
  const [columns, setColumns] = useState(
    dataset.columns || []
  );

  const [updatingColumnId, setUpdatingColumnId] =
    useState(null);

  const [error, setError] = useState(null);

  /*
   * Keep local columns synchronized if the
   * parent receives refreshed dataset data.
   */
  useEffect(() => {
    setColumns(dataset.columns || []);
  }, [dataset.columns]);

  /*
   * ------------------------------------------
   * PHASE 4
   * Manual classification override
   * ------------------------------------------
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
    <div
      style={{
        marginBottom: "40px",
      }}
    >
      <hr />

      <h2>{dataset.filename}</h2>

      <p>
        File Type:{" "}
        {dataset.file_type
          ? dataset.file_type.toUpperCase()
          : "-"}
      </p>

      <p>
        Uploaded:{" "}
        {dataset.uploaded_at
          ? new Date(
              dataset.uploaded_at
            ).toLocaleString()
          : "-"}
      </p>

      <p>
        <strong>
          {dataset.row_count ?? 0}
        </strong>{" "}
        Rows
      </p>

      <p>
        <strong>
          {dataset.column_count ?? 0}
        </strong>{" "}
        Columns
      </p>

      {/* =====================================
          PHASE 5 - DATA QUALITY SUMMARY
          ===================================== */}

      <h3>Data Quality</h3>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {/* Quality Score */}
        <QualityMetricCard
          title="Quality Score"
          value={
            dataset.quality_score != null
              ? `${Number(
                  dataset.quality_score
                ).toFixed(2)}%`
              : "N/A"
          }
          type="score"
          score={dataset.quality_score}
        />

        {/* Duplicate Rows */}
        <QualityMetricCard
          title="Duplicate Rows"
          value={
            dataset.duplicate_row_count ?? 0
          }
          type="duplicate"
        />

        {/* Invalid Values */}
        <QualityMetricCard
          title="Invalid Values"
          value={
            dataset.invalid_value_count ?? 0
          }
          type="invalid"
        />
      </div>

      <p
        style={{
          color: "#666",
          marginBottom: "20px",
        }}
      >
        Quality is calculated using missing
        values, duplicate rows, and invalid
        values.
      </p>

      {/* Quality status */}
      {dataset.quality_score != null && (
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <strong>
            Quality Status:{" "}
          </strong>

          <QualityStatusBadge
            score={dataset.quality_score}
          />
        </div>
      )}

      <h3>
        Discovered & Classified Columns
      </h3>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>
                Position
              </th>

              <th style={tableHeaderStyle}>
                Column Name
              </th>

              <th style={tableHeaderStyle}>
                Data Type
              </th>

              {/* PHASE 5 */}
              <th style={tableHeaderStyle}>
                Missing
              </th>

              {/* PHASE 5 */}
              <th style={tableHeaderStyle}>
                Missing %
              </th>

              {/* PHASE 5 */}
              <th style={tableHeaderStyle}>
                Invalid
              </th>

              {/* PHASE 4 */}
              <th style={tableHeaderStyle}>
                Sensitivity Tag
              </th>

              {/* PHASE 4 */}
              <th style={tableHeaderStyle}>
                Classification Source
              </th>

              {/* PHASE 4 */}
              <th style={tableHeaderStyle}>
                Override
              </th>
            </tr>
          </thead>

          <tbody>
            {columns.map((column) => (
              <tr key={column.id}>
                <td style={tableCellStyle}>
                  {column.position + 1}
                </td>

                <td style={tableCellStyle}>
                  {column.name}
                </td>

                <td style={tableCellStyle}>
                  {column.data_type}
                </td>

                {/* ==========================
                    PHASE 5
                    Missing Count
                    ========================== */}
                <td style={tableCellStyle}>
                  <MissingValueBadge
                    count={
                      column.missing_count
                    }
                  />
                </td>

                {/* ==========================
                    PHASE 5
                    Missing Percentage
                    ========================== */}
                <td style={tableCellStyle}>
                  <MissingPercentageBadge
                    percentage={
                      column.missing_percentage
                    }
                  />
                </td>

                {/* ==========================
                    PHASE 5
                    Invalid Count
                    ========================== */}
                <td style={tableCellStyle}>
                  <InvalidValueBadge
                    count={
                      column.invalid_count
                    }
                  />
                </td>

                {/* ==========================
                    PHASE 4
                    Sensitivity Tag
                    ========================== */}
                <td style={tableCellStyle}>
                  <ClassificationBadge
                    tag={
                      column.sensitivity_tag
                    }
                  />
                </td>

                {/* ==========================
                    PHASE 4
                    Classification Source
                    ========================== */}
                <td style={tableCellStyle}>
                  <ClassificationSource
                    source={
                      column.classification_source
                    }
                  />
                </td>

                {/* ==========================
                    PHASE 4
                    Manual Override
                    ========================== */}
                <td style={tableCellStyle}>
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
                    <span
                      style={{
                        marginLeft: "8px",
                        color: "#666",
                      }}
                    >
                      Updating...
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/*
 * ============================================
 * PHASE 5
 * Quality Metric Card
 * ============================================
 */
function QualityMetricCard({
  title,
  value,
  type,
  score,
}) {
  let background = "#f8fafc";
  let border = "#e2e8f0";

  if (type === "score" && score != null) {
    if (score >= 90) {
      background = "#f0fdf4";
      border = "#bbf7d0";
    } else if (score >= 70) {
      background = "#fffbeb";
      border = "#fde68a";
    } else {
      background = "#fef2f2";
      border = "#fecaca";
    }
  }

  if (type === "duplicate" && value > 0) {
    background = "#fff7ed";
    border = "#fed7aa";
  }

  if (type === "invalid" && value > 0) {
    background = "#fef2f2";
    border = "#fecaca";
  }

  return (
    <div
      style={{
        minWidth: "180px",
        padding: "16px",
        borderRadius: "10px",
        border: `1px solid ${border}`,
        backgroundColor: background,
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/*
 * ============================================
 * PHASE 5
 * Overall quality status
 * ============================================
 */
function QualityStatusBadge({ score }) {
  if (score == null) {
    return (
      <span
        style={{
          ...qualityBadgeBaseStyle,
          backgroundColor: "#e5e7eb",
          color: "#374151",
        }}
      >
        NOT CALCULATED
      </span>
    );
  }

  if (score >= 90) {
    return (
      <span
        style={{
          ...qualityBadgeBaseStyle,
          backgroundColor: "#dcfce7",
          color: "#166534",
        }}
      >
        EXCELLENT
      </span>
    );
  }

  if (score >= 70) {
    return (
      <span
        style={{
          ...qualityBadgeBaseStyle,
          backgroundColor: "#fef3c7",
          color: "#92400e",
        }}
      >
        NEEDS REVIEW
      </span>
    );
  }

  return (
    <span
      style={{
        ...qualityBadgeBaseStyle,
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      }}
    >
      POOR
    </span>
  );
}

/*
 * ============================================
 * PHASE 5
 * Missing count badge
 * ============================================
 */
function MissingValueBadge({ count }) {
  const value = count ?? 0;

  if (value === 0) {
    return (
      <span
        style={{
          ...qualityBadgeBaseStyle,
          backgroundColor: "#dcfce7",
          color: "#166534",
        }}
      >
        0
      </span>
    );
  }

  return (
    <span
      style={{
        ...qualityBadgeBaseStyle,
        backgroundColor: "#fef3c7",
        color: "#92400e",
      }}
    >
      {value}
    </span>
  );
}

/*
 * ============================================
 * PHASE 5
 * Missing percentage badge
 * ============================================
 */
function MissingPercentageBadge({
  percentage,
}) {
  const value = Number(percentage ?? 0);

  if (value === 0) {
    return (
      <span
        style={{
          ...qualityBadgeBaseStyle,
          backgroundColor: "#dcfce7",
          color: "#166534",
        }}
      >
        0%
      </span>
    );
  }

  if (value < 10) {
    return (
      <span
        style={{
          ...qualityBadgeBaseStyle,
          backgroundColor: "#fef3c7",
          color: "#92400e",
        }}
      >
        {value.toFixed(2)}%
      </span>
    );
  }

  return (
    <span
      style={{
        ...qualityBadgeBaseStyle,
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      }}
    >
      {value.toFixed(2)}%
    </span>
  );
}

/*
 * ============================================
 * PHASE 5
 * Invalid value badge
 * ============================================
 */
function InvalidValueBadge({ count }) {
  const value = count ?? 0;

  if (value === 0) {
    return (
      <span
        style={{
          ...qualityBadgeBaseStyle,
          backgroundColor: "#dcfce7",
          color: "#166534",
        }}
      >
        0
      </span>
    );
  }

  return (
    <span
      style={{
        ...qualityBadgeBaseStyle,
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      }}
    >
      {value}
    </span>
  );
}

/*
 * ============================================
 * PHASE 4
 * Sensitivity tag UI
 * ============================================
 */
function ClassificationBadge({ tag }) {
  if (!tag) {
    return (
      <span
        style={{
          ...qualityBadgeBaseStyle,
          backgroundColor: "#e5e7eb",
          color: "#374151",
        }}
      >
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
 * ============================================
 * PHASE 4
 * AUTO / MANUAL source UI
 * ============================================
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
      {isManual
        ? "MANUAL"
        : "AUTO"}
    </span>
  );
}

/*
 * ============================================
 * PHASE 4
 * Classification colors
 * ============================================
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

/*
 * ============================================
 * Shared styles
 * ============================================
 */

const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  backgroundColor: "#f5f5f5",
  textAlign: "left",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  verticalAlign: "middle",
};

const qualityBadgeBaseStyle = {
  display: "inline-block",
  padding: "4px 9px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
};

export default DatasetDiscoveryDashboard;