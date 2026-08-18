import { useEffect, useMemo, useState } from "react";

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

  /*
   * Which dataset is currently opened.
   *
   * null = dashboard only
   * dataset id = show column-level details
   */
  const [selectedDatasetId, setSelectedDatasetId] =
    useState(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      setLoading(true);
      setError(null);

      const response = await getDatasets();

      setDatasets(response.data || []);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load datasets."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Called after successful upload.
   *
   * New dataset appears at the top.
   */
  async function handleUploadSuccess(newDataset) {
  try {
    setError(null);

    /*
     * Upload was successful.
     *
     * Now fetch the complete dataset catalog again.
     * This gets columns, classification, quality data,
     * etc. without refreshing the browser.
     */
    const response = await getDatasets();

    const updatedDatasets =
      response.data || [];

    /*
     * Update the dropdown/catalog immediately.
     */
    setDatasets(updatedDatasets);

    /*
     * Automatically select the newly uploaded dataset.
     */
    setSelectedDatasetId(
      String(newDataset.id)
    );
  } catch (error) {
    console.error(
      "Unable to refresh dataset catalog:",
      error
    );

    setError(
      "Dataset uploaded successfully, but the dataset catalog could not be refreshed."
    );

    /*
     * Fallback:
     * Even if the GET request fails, show the newly
     * uploaded dataset in the UI.
     */
    setDatasets((currentDatasets) => {
      const exists =
        currentDatasets.some(
          (dataset) =>
            dataset.id === newDataset.id
        );

      if (exists) {
        return currentDatasets;
      }

      return [
        newDataset,
        ...currentDatasets,
      ];
    });

    setSelectedDatasetId(
      String(newDataset.id)
    );
  }
}

  /*
   * Overall dashboard statistics.
   */
  const dashboardStats = useMemo(() => {
    const totalDatasets = datasets.length;

    const totalRows = datasets.reduce(
      (sum, dataset) =>
        sum + Number(dataset.row_count || 0),
      0
    );

    const totalColumns = datasets.reduce(
      (sum, dataset) =>
        sum + Number(dataset.column_count || 0),
      0
    );

    const averageQuality =
      totalDatasets > 0
        ? datasets.reduce(
            (sum, dataset) =>
              sum +
              Number(
                dataset.quality_score || 0
              ),
            0
          ) / totalDatasets
        : 0;

    const averageTrust =
      totalDatasets > 0
        ? datasets.reduce(
            (sum, dataset) =>
              sum +
              Number(
                dataset.trust_score || 0
              ),
            0
          ) / totalDatasets
        : 0;

    const totalViews = datasets.reduce(
      (sum, dataset) =>
        sum +
        Number(
          dataset.view_count ??
            dataset.usage_count ??
            0
        ),
      0
    );

    return {
      totalDatasets,
      totalRows,
      totalColumns,
      averageQuality,
      averageTrust,
      totalViews,
    };
  }, [datasets]);

  const selectedDataset =
    datasets.find(
      (dataset) =>
        dataset.id === selectedDatasetId
    );

  return (
    <div style={pageStyle}>
      {/* ==========================================
          DASHBOARD HEADER
      ========================================== */}

      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            Data Governance Dashboard
          </h1>

          <p style={subtitleStyle}>
            Monitor your datasets, data quality,
            classification, trust and usage.
          </p>
        </div>

        <div>
          <DatasetUpload
            onUploadSuccess={
              handleUploadSuccess
            }
          />
        </div>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (
        <div style={loadingStyle}>
          Loading datasets...
        </div>
      )}

      {/* ==========================================
          EMPTY STATE
      ========================================== */}

      {!loading &&
        datasets.length === 0 && (
          <div style={emptyStateStyle}>
            <h2>No datasets yet</h2>

            <p>
              Upload a CSV or Excel file to
              start discovering and governing
              your data.
            </p>
          </div>
        )}

      {/* ==========================================
          DASHBOARD SUMMARY
      ========================================== */}

      {!loading &&
        datasets.length > 0 && (
          <>
            <section>
              <h2 style={sectionTitleStyle}>
                Overview
              </h2>

              <div style={summaryGridStyle}>
                <DashboardMetric
                  title="Datasets"
                  value={
                    dashboardStats.totalDatasets
                  }
                  description="Uploaded datasets"
                  type="blue"
                />

                <DashboardMetric
                  title="Total Rows"
                  value={formatNumber(
                    dashboardStats.totalRows
                  )}
                  description="Across all datasets"
                  type="purple"
                />

                <DashboardMetric
                  title="Total Columns"
                  value={formatNumber(
                    dashboardStats.totalColumns
                  )}
                  description="Discovered columns"
                  type="orange"
                />

                <DashboardMetric
                  title="Avg Quality"
                  value={`${dashboardStats.averageQuality.toFixed(
                    2
                  )}%`}
                  description="Average quality score"
                  type="green"
                />

                <DashboardMetric
                  title="Avg Trust"
                  value={`${dashboardStats.averageTrust.toFixed(
                    2
                  )}%`}
                  description="Average trust score"
                  type="green"
                />

                <DashboardMetric
                  title="Total Views"
                  value={formatNumber(
                    dashboardStats.totalViews
                  )}
                  description="Dataset usage"
                  type="gray"
                />
              </div>
            </section>

            {/* ======================================
                DATASET LIST
            ====================================== */}

            <section>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    ...sectionTitleStyle,
                    marginBottom: 0,
                  }}
                >
                  Dataset Catalog
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {datasets.map((dataset) => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    isSelected={
                      selectedDatasetId ===
                      dataset.id
                    }
                    onSelect={() =>
                      setSelectedDatasetId(
                        selectedDatasetId ===
                          dataset.id
                          ? null
                          : dataset.id
                      )
                    }
                    onDatasetUpdated={(
                      updatedDataset
                    ) => {
                      setDatasets(
                        (currentDatasets) =>
                          currentDatasets.map(
                            (item) =>
                              item.id ===
                              updatedDataset.id
                                ? updatedDataset
                                : item
                          )
                      );
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        )}

      {/* ==========================================
          OPTIONAL SELECTED DATASET INFORMATION
      ========================================== */}

      {selectedDataset && (
        <div
          style={{
            marginTop: "25px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Showing detailed information for:

          <strong
            style={{
              marginLeft: "5px",
              color: "#334155",
            }}
          >
            {selectedDataset.filename}
          </strong>
        </div>
      )}
    </div>
  );
}

/*
 * ==================================================
 * DATASET CARD
 * ==================================================
 */

function DatasetCard({
  dataset,
  isSelected,
  onSelect,
  onDatasetUpdated,
}) {
  const [columns, setColumns] = useState(
    dataset.columns || []
  );

  const [
    updatingColumnId,
    setUpdatingColumnId,
  ] = useState(null);

  const [error, setError] = useState(null);

  /*
   * Keep columns synchronized when the
   * parent dataset changes.
   */
  useEffect(() => {
    setColumns(dataset.columns || []);
  }, [dataset.columns]);

  /*
   * Classification coverage.
   *
   * Example:
   *
   * 8 classified / 10 columns
   * = 80%
   */
  const classificationCoverage =
    useMemo(() => {
      if (!columns.length) {
        return 0;
      }

      const classified =
        columns.filter(
          (column) =>
            column.sensitivity_tag
        ).length;

      return (
        (classified / columns.length) *
        100
      );
    }, [columns]);

  /*
   * Manual classification override.
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

      const updatedColumn =
        response.data;

      const updatedColumns =
        columns.map((column) =>
          column.id === columnId
            ? updatedColumn
            : column
        );

      setColumns(updatedColumns);

      /*
       * Update parent dataset as well.
       */
      onDatasetUpdated({
        ...dataset,
        columns: updatedColumns,
      });
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
    <div style={datasetCardStyle}>
      {/* ========================================
          DATASET HEADER
      ======================================== */}

      <div style={datasetHeaderStyle}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#172033",
                fontSize: "20px",
              }}
            >
              {dataset.filename}
            </h3>

            <span
              style={fileTypeBadgeStyle}
            >
              {dataset.file_type
                ? dataset.file_type
                    .replace(".", "")
                    .toUpperCase()
                : "FILE"}
            </span>
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Uploaded{" "}
            {dataset.uploaded_at
              ? new Date(
                  dataset.uploaded_at
                ).toLocaleString()
              : "-"}
          </div>
        </div>

        <button
          onClick={onSelect}
          style={
            isSelected
              ? closeButtonStyle
              : primaryButtonStyle
          }
        >
          {isSelected
            ? "Hide Details"
            : "View Details"}
        </button>
      </div>

      {/* ========================================
          DATASET BASIC METADATA
      ======================================== */}

      <div style={metadataGridStyle}>
        <MiniStat
          label="Rows"
          value={formatNumber(
            dataset.row_count
          )}
        />

        <MiniStat
          label="Columns"
          value={formatNumber(
            dataset.column_count
          )}
        />

        <MiniStat
          label="Views"
          value={formatNumber(
            dataset.view_count ??
              dataset.usage_count ??
              0
          )}
        />

        <MiniStat
          label="Classified"
          value={`${classificationCoverage.toFixed(
            0
          )}%`}
        />
      </div>

      {/* ========================================
          QUALITY / TRUST / VALUE
      ======================================== */}

      <div style={scoreGridStyle}>
        <ScoreCard
          title="Quality Score"
          score={
            dataset.quality_score
          }
          description="Data quality"
        />

        <ScoreCard
          title="Trust Score"
          score={
            dataset.trust_score
          }
          description="Reliability"
        />

        <ScoreCard
          title="Data Value"
          score={
            dataset.data_value_score
          }
          description="Usage / business value"
        />

        <ScoreCard
          title="Classification"
          score={
            classificationCoverage
          }
          description="Columns classified"
        />
      </div>

      {/* ========================================
          QUALITY DETAILS
      ======================================== */}

      <div style={qualitySummaryStyle}>
        <QualitySummaryItem
          label="Completeness"
          value={
            dataset.completeness_score
          }
        />

        <QualitySummaryItem
          label="Accuracy"
          value={
            dataset.accuracy_score
          }
        />

        <QualitySummaryItem
          label="Consistency"
          value={
            dataset.consistency_score
          }
        />

        <QualityCountItem
          label="Duplicate Rows"
          value={
            dataset.duplicate_row_count
          }
        />

        <QualityCountItem
          label="Invalid Values"
          value={
            dataset.invalid_value_count
          }
        />
      </div>

      {/* ========================================
          EXPANDED COLUMN DETAILS
      ======================================== */}

      {isSelected && (
        <div
          style={{
            marginTop: "25px",
            borderTop:
              "1px solid #e2e8f0",
            paddingTop: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "15px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#172033",
                }}
              >
                Column-Level Details
              </h3>

              <p
                style={{
                  margin:
                    "5px 0 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Review discovery,
                classification and
                quality information
                for every column.
              </p>
            </div>
          </div>

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {columns.length === 0 ? (
            <div
              style={emptyColumnsStyle}
            >
              No column information
              available.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {columns.map(
                (column) => (
                  <ColumnDetail
                    key={column.id}
                    column={column}
                    updating={
                      updatingColumnId ===
                      column.id
                    }
                    onClassificationChange={
                      handleClassificationChange
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/*
 * ==================================================
 * COLUMN DETAIL
 * ==================================================
 *
 * Each column can be opened individually.
 */

function ColumnDetail({
  column,
  updating,
  onClassificationChange,
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  return (
    <div style={columnContainerStyle}>
      {/* ========================================
          COLUMN SUMMARY
      ======================================== */}

      <button
        onClick={() =>
          setExpanded(!expanded)
        }
        style={columnButtonStyle}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={columnNumberStyle}
          >
            {(column.position ?? 0) + 1}
          </span>

          <div
            style={{
              textAlign: "left",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontWeight: "700",
                color: "#172033",
                overflow: "hidden",
                textOverflow:
                  "ellipsis",
                whiteSpace:
                  "nowrap",
              }}
            >
              {column.name}
            </div>

            <div
              style={{
                marginTop: "3px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              {column.data_type ||
                "unknown"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ClassificationBadge
            tag={
              column.sensitivity_tag
            }
          />

          <span
            style={{
              color: "#64748b",
              fontSize: "18px",
            }}
          >
            {expanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {/* ========================================
          COLUMN FULL DETAILS
      ======================================== */}

      {expanded && (
        <div
          style={columnDetailsStyle}
        >
          <div
            style={
              columnDetailsGridStyle
            }
          >
            <DetailItem
              label="Column Name"
              value={column.name}
            />

            <DetailItem
              label="Data Type"
              value={
                column.data_type ||
                "Unknown"
              }
            />

            <DetailItem
              label="Position"
              value={
                (column.position ??
                  0) + 1
              }
            />

            <DetailItem
              label="Missing Count"
              value={
                column.missing_count ??
                0
              }
            />

            <DetailItem
              label="Missing %"
              value={`${Number(
                column.missing_percentage ??
                  0
              ).toFixed(2)}%`}
            />

            <DetailItem
              label="Invalid Count"
              value={
                column.invalid_count ??
                0
              }
            />

            <DetailItem
              label="Sensitivity"
              value={
                column.sensitivity_tag ||
                "UNCLASSIFIED"
              }
            />

            <DetailItem
              label="Classification Source"
              value={
                column.classification_source ||
                "-"
              }
            />
          </div>

          {/* ====================================
              MANUAL CLASSIFICATION
          ==================================== */}

          <div
            style={{
              marginTop: "18px",
              paddingTop: "18px",
              borderTop:
                "1px solid #e2e8f0",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                color: "#334155",
                marginBottom: "7px",
              }}
            >
              Manual Classification
            </label>

            <select
              value={
                column.sensitivity_tag ||
                ""
              }
              disabled={updating}
              onChange={(event) =>
                onClassificationChange(
                  column.id,
                  event.target.value
                )
              }
              style={selectStyle}
            >
              <option
                value=""
                disabled
              >
                Select classification
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

            {updating && (
              <span
                style={{
                  marginLeft: "10px",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Updating...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * ==================================================
 * DASHBOARD METRIC
 * ==================================================
 */

function DashboardMetric({
  title,
  value,
  description,
  type,
}) {
  const colors =
    getMetricColors(type);

  return (
    <div
      style={{
        ...dashboardMetricStyle,
        borderTop: `4px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#172033",
          fontSize: "26px",
          fontWeight: "800",
          marginTop: "7px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "4px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

/*
 * ==================================================
 * SCORE CARD
 * ==================================================
 */

function ScoreCard({
  title,
  score,
  description,
}) {
  const numericScore =
    score == null
      ? null
      : Number(score);

  return (
    <div style={scoreCardStyle}>
      <div
        style={{
          color: "#64748b",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: "7px",
          fontSize: "22px",
          fontWeight: "800",
          color: getScoreColor(
            numericScore
          ),
        }}
      >
        {numericScore == null ||
        Number.isNaN(
          numericScore
        )
          ? "N/A"
          : `${numericScore.toFixed(
              2
            )}%`}
      </div>

      <div
        style={{
          marginTop: "3px",
          fontSize: "11px",
          color: "#94a3b8",
        }}
      >
        {description}
      </div>
    </div>
  );
}

/*
 * ==================================================
 * QUALITY SUMMARY
 * ==================================================
 */

function QualitySummaryItem({
  label,
  value,
}) {
  return (
    <div style={qualityItemStyle}>
      <span
        style={{
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color: getScoreColor(
            value
          ),
        }}
      >
        {formatScore(value)}
      </strong>
    </div>
  );
}

function QualityCountItem({
  label,
  value,
}) {
  const numericValue =
    Number(value || 0);

  return (
    <div style={qualityItemStyle}>
      <span
        style={{
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color:
            numericValue > 0
              ? "#dc2626"
              : "#16a34a",
        }}
      >
        {numericValue}
      </strong>
    </div>
  );
}

/*
 * ==================================================
 * MINI STAT
 * ==================================================
 */

function MiniStat({
  label,
  value,
}) {
  return (
    <div style={miniStatStyle}>
      <div
        style={{
          fontSize: "12px",
          color: "#64748b",
          fontWeight: "600",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "4px",
          fontSize: "18px",
          fontWeight: "800",
          color: "#172033",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/*
 * ==================================================
 * DETAIL ITEM
 * ==================================================
 */

function DetailItem({
  label,
  value,
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "5px",
          color: "#334155",
          fontSize: "14px",
          fontWeight: "600",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/*
 * ==================================================
 * CLASSIFICATION BADGE
 * ==================================================
 */

function ClassificationBadge({
  tag,
}) {
  if (!tag) {
    return (
      <span
        style={{
          ...badgeBaseStyle,
          backgroundColor:
            "#f1f5f9",
          color: "#64748b",
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
        ...badgeBaseStyle,
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
 * ==================================================
 * HELPERS
 * ==================================================
 */

function formatNumber(value) {
  return Number(
    value || 0
  ).toLocaleString();
}

function formatScore(value) {
  if (value == null) {
    return "N/A";
  }

  const numeric =
    Number(value);

  if (
    Number.isNaN(numeric)
  ) {
    return "N/A";
  }

  return `${numeric.toFixed(2)}%`;
}

function getScoreColor(score) {
  if (score == null) {
    return "#94a3b8";
  }

  const numeric =
    Number(score);

  if (numeric >= 90) {
    return "#16a34a";
  }

  if (numeric >= 70) {
    return "#d97706";
  }

  return "#dc2626";
}

function getMetricColors(type) {
  switch (type) {
    case "blue":
      return {
        border: "#2563eb",
      };

    case "purple":
      return {
        border: "#7c3aed",
      };

    case "orange":
      return {
        border: "#ea580c",
      };

    case "green":
      return {
        border: "#16a34a",
      };

    default:
      return {
        border: "#64748b",
      };
  }
}

function getClassificationColors(
  tag
) {
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
 * ==================================================
 * STYLES
 * ==================================================
 */

const pageStyle = {
  maxWidth: "1450px",
  margin: "0 auto",
  padding: "30px",
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "30px",
};

const titleStyle = {
  margin: 0,
  color: "#172033",
  fontSize: "30px",
  fontWeight: "800",
};

const subtitleStyle = {
  marginTop: "7px",
  color: "#64748b",
  fontSize: "14px",
};

const sectionTitleStyle = {
  margin: "0 0 16px 0",
  color: "#172033",
  fontSize: "20px",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
  marginBottom: "35px",
};

const dashboardMetricStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "18px",
  boxShadow:
    "0 2px 8px rgba(15,23,42,0.04)",
};

const datasetCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "22px",
  boxShadow:
    "0 3px 12px rgba(15,23,42,0.05)",
};

const datasetHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
};

const fileTypeBadgeStyle = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "6px",
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
  fontSize: "11px",
  fontWeight: "700",
};

const metadataGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(130px, 1fr))",
  gap: "10px",
  marginTop: "20px",
};

const miniStatStyle = {
  padding: "13px",
  backgroundColor: "#f8fafc",
  borderRadius: "9px",
  border: "1px solid #e2e8f0",
};

const scoreGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "10px",
  marginTop: "12px",
};

const scoreCardStyle = {
  padding: "15px",
  border: "1px solid #e2e8f0",
  borderRadius: "9px",
  backgroundColor: "#ffffff",
};

const qualitySummaryStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "15px",
  paddingTop: "15px",
  borderTop: "1px solid #e2e8f0",
};

const qualityItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  minWidth: "150px",
  padding: "9px 12px",
  borderRadius: "7px",
  backgroundColor: "#f8fafc",
  fontSize: "12px",
};

const columnContainerStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  overflow: "hidden",
};

const columnButtonStyle = {
  width: "100%",
  border: "none",
  backgroundColor: "#ffffff",
  padding: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "15px",
  textAlign: "left",
};

const columnNumberStyle = {
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  backgroundColor: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: "800",
  flexShrink: 0,
};

const columnDetailsStyle = {
  padding: "18px",
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
};

const columnDetailsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "18px",
};

const badgeBaseStyle = {
  display: "inline-block",
  padding: "4px 9px",
  borderRadius: "999px",
  fontSize: "10px",
  fontWeight: "800",
  whiteSpace: "nowrap",
};

const selectStyle = {
  padding: "9px 12px",
  borderRadius: "7px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#334155",
  fontSize: "13px",
  cursor: "pointer",
};

const primaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
};

const closeButtonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#334155",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "8px 14px",
  borderRadius: "7px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#334155",
  fontWeight: "600",
  cursor: "pointer",
};

const errorStyle = {
  marginBottom: "18px",
  padding: "12px 15px",
  borderRadius: "8px",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};

const loadingStyle = {
  padding: "30px",
  textAlign: "center",
  color: "#64748b",
};

const emptyStateStyle = {
  padding: "60px 20px",
  textAlign: "center",
  backgroundColor: "#ffffff",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  color: "#64748b",
};

const emptyColumnsStyle = {
  padding: "30px",
  textAlign: "center",
  backgroundColor: "#f8fafc",
  borderRadius: "10px",
  color: "#64748b",
};

export default DatasetDiscoveryDashboard;