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

  const [selectedDatasetId, setSelectedDatasetId] =
    useState(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  /*
   * ==================================================
   * LOAD DATASETS
   * ==================================================
   */

  async function loadDatasets() {
    try {
      setLoading(true);
      setError(null);

      const response = await getDatasets();

      setDatasets(response.data || []);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load datasets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==================================================
   * UPLOAD SUCCESS
   * ==================================================
   */

  async function handleUploadSuccess(newDataset) {
    try {
      setError(null);

      const response = await getDatasets();

      const updatedDatasets =
        response.data || [];

      setDatasets(updatedDatasets);

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

      setDatasets((currentDatasets) => {
        const exists =
          currentDatasets.some(
            (dataset) =>
              String(dataset.id) ===
              String(newDataset.id)
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
   * ==================================================
   * DASHBOARD STATISTICS
   * ==================================================
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
        String(dataset.id) ===
        String(selectedDatasetId)
    );

  return (
    <>
      <style>
        {`
          html,
          body,
          #root {
            width: 100%;
            min-width: 100%;
            min-height: 100%;
            margin: 0;
            padding: 0;
          }

          html {
            box-sizing: border-box;
          }

          *,
          *::before,
          *::after {
            box-sizing: inherit;
          }

          body {
            background: #f8fafc;
            color: #172033;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          button,
          input,
          select {
            font-family: inherit;
          }

          .dashboard-page {
            width: 100vw;
            min-height: 100vh;
            margin-left: calc(50% - 50vw);
            background: #f8fafc;
          }

          .dashboard-content {
            width: 100%;
            max-width: 1550px;
            margin: 0 auto;
            padding: 32px 40px 60px;
          }

          .dashboard-upload-panel {
            width: 100%;
            min-width: 300px;
          }

          .dashboard-upload-panel input[type="file"] {
            width: 100%;
            min-height: 42px;
            padding: 6px;
            border: 1px dashed #cbd5e1;
            border-radius: 10px;
            background: #ffffff;
            color: #64748b;
            font-size: 12px;
          }

          .dashboard-upload-panel input[type="file"]::file-selector-button {
            margin-right: 10px;
            padding: 8px 12px;
            border: none;
            border-radius: 7px;
            background: #eff6ff;
            color: #2563eb;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          .dashboard-upload-panel button {
            min-height: 40px;
            padding: 9px 16px;
            border: none;
            border-radius: 8px;
            background: #2563eb;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition:
              background-color 0.2s ease,
              transform 0.2s ease;
          }

          .dashboard-upload-panel button:hover:not(:disabled) {
            background: #1d4ed8;
            transform: translateY(-1px);
          }

          .dashboard-upload-panel button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .dashboard-upload-panel h2,
          .dashboard-upload-panel h3 {
            margin-top: 0;
            color: #172033;
          }

          @media (max-width: 1100px) {
            .dashboard-content {
              padding: 28px 24px 50px;
            }
          }

          @media (max-width: 700px) {
            .dashboard-content {
              padding: 20px 14px 40px;
            }

            .dashboard-content h1 {
              font-size: 26px !important;
            }
          }
        `}
      </style>

      <div className="dashboard-page">
        <div className="dashboard-content">
          {/* ==========================================
              DASHBOARD HEADER
          ========================================== */}

          <div style={heroStyle}>
            <div style={heroContentStyle}>
              <div style={heroTextStyle}>
                <div style={eyebrowStyle}>
                  DATA GOVERNANCE
                </div>

                <h1 style={titleStyle}>
                  Data Governance Dashboard
                </h1>

                <p style={subtitleStyle}>
                  Monitor your datasets, data
                  quality, classification, trust
                  and usage.
                </p>

                <div style={headerStatsStyle}>
                  <div style={headerStatItemStyle}>
                    <span
                      style={headerStatDotStyle}
                    />
                    Dataset monitoring
                  </div>

                  <div style={headerStatItemStyle}>
                    <span
                      style={headerStatDotStyle}
                    />
                    Data classification
                  </div>

                  <div style={headerStatItemStyle}>
                    <span
                      style={headerStatDotStyle}
                    />
                    Quality tracking
                  </div>
                </div>
              </div>

              <div
                className="dashboard-upload-panel"
                style={uploadPanelStyle}
              >
                <div style={uploadPanelHeaderStyle}>
                  <div>
                    <div style={uploadLabelStyle}>
                      DATA IMPORT
                    </div>

                    <h2 style={uploadTitleStyle}>
                      Upload Dataset
                    </h2>

                    <p
                      style={
                        uploadDescriptionStyle
                      }
                    >
                      Import a CSV or Excel file
                      to start governing your
                      data.
                    </p>
                  </div>

                  <div style={uploadIconStyle}>
                    ↑
                  </div>
                </div>

                <DatasetUpload
                  onUploadSuccess={
                    handleUploadSuccess
                  }
                />

                <div style={uploadHintStyle}>
                  Supported formats: CSV, XLS,
                  XLSX
                </div>
              </div>
            </div>
          </div>

          {/* ==========================================
              ERROR
          ========================================== */}

          {error && (
            <div style={errorAlertStyle}>
              <div style={errorIconStyle}>
                !
              </div>

              <div style={errorContentStyle}>
                <div style={errorTitleStyle}>
                  Something went wrong
                </div>

                <div style={errorMessageStyle}>
                  {error}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setError(null)}
                style={errorCloseButtonStyle}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* ==========================================
              LOADING
          ========================================== */}

          {loading && (
            <div style={loadingCardStyle}>
              <div style={loadingSpinnerStyle}>
                ⟳
              </div>

              <div>
                <div style={loadingTitleStyle}>
                  Loading datasets
                </div>

                <div
                  style={loadingMessageStyle}
                >
                  Fetching your dataset catalog...
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              EMPTY STATE
          ========================================== */}

          {!loading &&
            datasets.length === 0 && (
              <div style={emptyStateStyle}>
                <div style={emptyIconStyle}>
                  +
                </div>

                <h2 style={emptyTitleStyle}>
                  No datasets yet
                </h2>

                <p style={emptyMessageStyle}>
                  Upload a CSV or Excel file to
                  start discovering and
                  governing your data.
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
                  <div style={sectionHeadingStyle}>
                    <div>
                      <h2
                        style={sectionTitleStyle}
                      >
                        Overview
                      </h2>

                      <p
                        style={
                          sectionDescriptionStyle
                        }
                      >
                        A high-level view of your
                        data governance activity.
                      </p>
                    </div>
                  </div>

                  <div
                    style={summaryGridStyle}
                  >
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
                    style={catalogHeaderStyle}
                  >
                    <div>
                      <h2
                        style={{
                          ...sectionTitleStyle,
                          marginBottom: "4px",
                        }}
                      >
                        Dataset Catalog
                      </h2>

                      <p
                        style={
                          sectionDescriptionStyle
                        }
                      >
                        Browse and manage your
                        uploaded datasets.
                      </p>
                    </div>

                    <div
                      style={
                        datasetCountBadgeStyle
                      }
                    >
                      {datasets.length}{" "}
                      {datasets.length === 1
                        ? "dataset"
                        : "datasets"}
                    </div>
                  </div>

                  <div
                    style={datasetListStyle}
                  >
                    {datasets.map((dataset) => (
                      <DatasetCard
                        key={dataset.id}
                        dataset={dataset}
                        isSelected={
                          String(
                            selectedDatasetId
                          ) ===
                          String(dataset.id)
                        }
                        onSelect={() =>
                          setSelectedDatasetId(
                            String(
                              selectedDatasetId
                            ) ===
                              String(dataset.id)
                              ? null
                              : String(dataset.id)
                          )
                        }
                        onDatasetUpdated={(
                          updatedDataset
                        ) => {
                          setDatasets(
                            (currentDatasets) =>
                              currentDatasets.map(
                                (item) =>
                                  String(
                                    item.id
                                  ) ===
                                  String(
                                    updatedDataset.id
                                  )
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
              SELECTED DATASET INFORMATION
          ========================================== */}

          {selectedDataset && (
            <div style={selectedInfoStyle}>
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
      </div>
    </>
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

  useEffect(() => {
    setColumns(dataset.columns || []);
  }, [dataset.columns]);

  /*
   * ==================================================
   * CLASSIFICATION COVERAGE
   * ==================================================
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
   * ==================================================
   * MANUAL CLASSIFICATION
   * ==================================================
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

      onDatasetUpdated({
        ...dataset,
        columns: updatedColumns,
      });
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update the classification. Please try again."
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
        <div style={datasetTitleWrapperStyle}>
          <div style={datasetTitleRowStyle}>
            <div style={fileIconBadgeStyle}>
              CSV
            </div>

            <h3 style={datasetTitleStyle}>
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
            style={datasetUploadDateStyle}
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
          score={dataset.quality_score}
          description="Data quality"
        />

        <ScoreCard
          title="Trust Score"
          score={dataset.trust_score}
          description="Reliability"
        />

        <ScoreCard
          title="Data Value"
          score={dataset.data_value_score}
          description="Usage / business value"
        />

        <ScoreCard
          title="Classification"
          score={classificationCoverage}
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
          value={dataset.accuracy_score}
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
        <div style={expandedSectionStyle}>
          <div style={expandedHeaderStyle}>
            <div>
              <div
                style={
                  expandedSectionBadgeStyle
                }
              >
                COLUMN MANAGEMENT
              </div>

              <h3
                style={
                  expandedSectionTitleStyle
                }
              >
                Column-Level Details
              </h3>

              <p
                style={
                  expandedSectionDescriptionStyle
                }
              >
                Review discovery,
                classification and quality
                information for every column.
              </p>
            </div>

            <div
              style={columnCountBadgeStyle}
            >
              {columns.length} columns
            </div>
          </div>

          {error && (
            <div style={smallErrorStyle}>
              <span
                style={smallErrorIconStyle}
              >
                !
              </span>

              <span>{error}</span>
            </div>
          )}

          {columns.length === 0 ? (
            <div style={emptyColumnsStyle}>
              <div
                style={emptyColumnsIconStyle}
              >
                —
              </div>

              <div
                style={emptyColumnsTitleStyle}
              >
                No column information
                available
              </div>

              <div
                style={
                  emptyColumnsMessageStyle
                }
              >
                Column details will appear
                here when available.
              </div>
            </div>
          ) : (
            <div style={columnsListStyle}>
              {columns.map((column) => (
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
              ))}
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
        <div style={columnSummaryLeftStyle}>
          <span
            style={columnNumberStyle}
          >
            {(column.position ?? 0) + 1}
          </span>

          <div
            style={columnTextWrapperStyle}
          >
            <div style={columnNameStyle}>
              {column.name}
            </div>

            <div
              style={columnTypeStyle}
            >
              {column.data_type ||
                "unknown"}
            </div>
          </div>
        </div>

        <div style={columnSummaryRightStyle}>
          <ClassificationBadge
            tag={column.sensitivity_tag}
          />

          <span style={expandIconStyle}>
            {expanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {/* ========================================
          COLUMN FULL DETAILS
      ======================================== */}

      {expanded && (
        <div style={columnDetailsStyle}>
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
                (column.position ?? 0) +
                1
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
            style={
              manualClassificationStyle
            }
          >
            <div
              style={
                manualClassificationHeaderStyle
              }
            >
              <div>
                <div
                  style={
                    manualClassificationTitleStyle
                  }
                >
                  Manual Classification
                </div>

                <div
                  style={
                    manualClassificationDescriptionStyle
                  }
                >
                  Override the automatically
                  detected sensitivity level.
                </div>
              </div>

              {updating && (
                <span
                  style={
                    updatingBadgeStyle
                  }
                >
                  Updating...
                </span>
              )}
            </div>

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
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={
            dashboardMetricTitleStyle
          }
        >
          {title}
        </div>

        <div
          style={{
            ...metricDotStyle,
            backgroundColor:
              colors.border,
          }}
        />
      </div>

      <div
        style={
          dashboardMetricValueStyle
        }
      >
        {value}
      </div>

      <div
        style={
          dashboardMetricDescriptionStyle
        }
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
        style={
          scoreCardTitleStyle
        }
      >
        {title}
      </div>

      <div
        style={{
          ...scoreCardValueStyle,
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
        style={
          scoreCardDescriptionStyle
        }
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
      <span>{label}</span>

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
      <span>{label}</span>

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
        style={
          miniStatLabelStyle
        }
      >
        {label}
      </div>

      <div
        style={
          miniStatValueStyle
        }
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
        style={
          detailItemLabelStyle
        }
      >
        {label}
      </div>

      <div
        style={
          detailItemValueStyle
        }
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
 * PAGE / HERO STYLES
 * ==================================================
 */

const heroStyle = {
  width: "100%",
  marginBottom: "30px",
};

const heroContentStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "stretch",
  gap: "30px",
  flexWrap: "wrap",
  padding: "30px",
  background:
    "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  boxShadow:
    "0 5px 20px rgba(15, 23, 42, 0.05)",
};

const heroTextStyle = {
  flex: "1 1 500px",
  minWidth: 0,
  padding: "8px 0",
};

const eyebrowStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 11px",
  marginBottom: "12px",
  borderRadius: "999px",
  backgroundColor: "#eff6ff",
  color: "#2563eb",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "0.1em",
};

const titleStyle = {
  margin: 0,
  color: "#172033",
  fontSize: "34px",
  lineHeight: "1.15",
  fontWeight: "800",
  letterSpacing: "-0.03em",
};

const subtitleStyle = {
  maxWidth: "650px",
  margin: "10px 0 0",
  color: "#64748b",
  fontSize: "15px",
  lineHeight: "1.6",
};

const headerStatsStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "18px",
  marginTop: "22px",
};

const headerStatItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
};

const headerStatDotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  backgroundColor: "#2563eb",
};

const uploadPanelStyle = {
  flex: "1 1 360px",
  maxWidth: "430px",
  padding: "20px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "15px",
};

const uploadPanelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "15px",
  marginBottom: "15px",
};

const uploadLabelStyle = {
  marginBottom: "5px",
  color: "#2563eb",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "0.08em",
};

const uploadTitleStyle = {
  margin: 0,
  color: "#172033",
  fontSize: "18px",
  fontWeight: "800",
};

const uploadDescriptionStyle = {
  maxWidth: "300px",
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "1.5",
};

const uploadIconStyle = {
  width: "40px",
  height: "40px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  backgroundColor: "#eff6ff",
  color: "#2563eb",
  fontSize: "21px",
  fontWeight: "800",
};

const uploadHintStyle = {
  marginTop: "10px",
  color: "#94a3b8",
  fontSize: "10px",
  textAlign: "center",
};

/*
 * ==================================================
 * SECTION STYLES
 * ==================================================
 */

const sectionHeadingStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "15px",
  marginBottom: "18px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#172033",
  fontSize: "22px",
  fontWeight: "800",
  letterSpacing: "-0.02em",
};

const sectionDescriptionStyle = {
  margin: "4px 0 0",
  color: "#94a3b8",
  fontSize: "12px",
};

const catalogHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const datasetCountBadgeStyle = {
  padding: "7px 12px",
  borderRadius: "999px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "700",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "18px",
  marginBottom: "40px",
};

const dashboardMetricStyle = {
  minHeight: "132px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "20px",
  boxShadow:
    "0 4px 14px rgba(15, 23, 42, 0.05)",
};

const dashboardMetricTitleStyle = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "700",
};

const dashboardMetricValueStyle = {
  marginTop: "7px",
  color: "#172033",
  fontSize: "27px",
  fontWeight: "800",
  letterSpacing: "-0.02em",
};

const dashboardMetricDescriptionStyle = {
  marginTop: "4px",
  color: "#94a3b8",
  fontSize: "11px",
};

const metricDotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
};

const datasetListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

/*
 * ==================================================
 * DATASET CARD STYLES
 * ==================================================
 */

const datasetCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow:
    "0 4px 16px rgba(15, 23, 42, 0.05)",
};

const datasetHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
};

const datasetTitleWrapperStyle = {
  flex: 1,
  minWidth: 0,
};

const datasetTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const fileIconBadgeStyle = {
  width: "32px",
  height: "32px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  backgroundColor: "#eff6ff",
  color: "#2563eb",
  fontSize: "9px",
  fontWeight: "800",
};

const datasetTitleStyle = {
  margin: 0,
  color: "#172033",
  fontSize: "19px",
  fontWeight: "800",
  wordBreak: "break-word",
};

const fileTypeBadgeStyle = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "6px",
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: "800",
};

const datasetUploadDateStyle = {
  marginTop: "8px",
  color: "#94a3b8",
  fontSize: "11px",
};

const metadataGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "12px",
  marginTop: "22px",
};

const miniStatStyle = {
  padding: "14px",
  backgroundColor: "#f8fafc",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
};

const miniStatLabelStyle = {
  fontSize: "11px",
  color: "#64748b",
  fontWeight: "700",
};

const miniStatValueStyle = {
  marginTop: "5px",
  fontSize: "19px",
  fontWeight: "800",
  color: "#172033",
};

const scoreGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginTop: "14px",
};

const scoreCardStyle = {
  padding: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  backgroundColor: "#ffffff",
};

const scoreCardTitleStyle = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "700",
};

const scoreCardValueStyle = {
  marginTop: "7px",
  fontSize: "23px",
  fontWeight: "800",
};

const scoreCardDescriptionStyle = {
  marginTop: "3px",
  fontSize: "10px",
  color: "#94a3b8",
};

const qualitySummaryStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "10px",
  marginTop: "16px",
  paddingTop: "16px",
  borderTop: "1px solid #e2e8f0",
};

const qualityItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "10px 12px",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  fontSize: "11px",
  color: "#64748b",
};

/*
 * ==================================================
 * EXPANDED SECTION
 * ==================================================
 */

const expandedSectionStyle = {
  marginTop: "25px",
  paddingTop: "24px",
  borderTop: "1px solid #e2e8f0",
};

const expandedHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const expandedSectionBadgeStyle = {
  display: "inline-block",
  marginBottom: "6px",
  color: "#2563eb",
  fontSize: "9px",
  fontWeight: "800",
  letterSpacing: "0.08em",
};

const expandedSectionTitleStyle = {
  margin: 0,
  color: "#172033",
  fontSize: "18px",
  fontWeight: "800",
};

const expandedSectionDescriptionStyle = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: "12px",
};

const columnCountBadgeStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: "700",
};

const columnsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const columnContainerStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "11px",
  overflow: "hidden",
  backgroundColor: "#ffffff",
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

const columnSummaryLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flex: 1,
  minWidth: 0,
};

const columnTextWrapperStyle = {
  minWidth: 0,
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
  fontSize: "11px",
  fontWeight: "800",
  flexShrink: 0,
};

const columnNameStyle = {
  fontWeight: "700",
  color: "#172033",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "13px",
};

const columnTypeStyle = {
  marginTop: "3px",
  color: "#94a3b8",
  fontSize: "11px",
};

const columnSummaryRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const expandIconStyle = {
  color: "#64748b",
  fontSize: "18px",
  width: "20px",
  textAlign: "center",
};

const columnDetailsStyle = {
  padding: "20px",
  backgroundColor: "#f8fafc",
  borderTop: "1px solid #e2e8f0",
};

const columnDetailsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "20px",
};

const detailItemLabelStyle = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const detailItemValueStyle = {
  marginTop: "5px",
  color: "#334155",
  fontSize: "13px",
  fontWeight: "600",
  wordBreak: "break-word",
};

const manualClassificationStyle = {
  marginTop: "20px",
  paddingTop: "20px",
  borderTop: "1px solid #e2e8f0",
};

const manualClassificationHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "10px",
};

const manualClassificationTitleStyle = {
  color: "#334155",
  fontSize: "13px",
  fontWeight: "800",
};

const manualClassificationDescriptionStyle = {
  marginTop: "3px",
  color: "#94a3b8",
  fontSize: "11px",
};

const updatingBadgeStyle = {
  padding: "5px 9px",
  borderRadius: "999px",
  backgroundColor: "#eff6ff",
  color: "#2563eb",
  fontSize: "10px",
  fontWeight: "700",
};

const selectStyle = {
  width: "100%",
  maxWidth: "300px",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#334155",
  fontSize: "12px",
  cursor: "pointer",
  outline: "none",
};

const badgeBaseStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "9px",
  fontWeight: "800",
  whiteSpace: "nowrap",
};

/*
 * ==================================================
 * BUTTONS
 * ==================================================
 */

const primaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "12px",
  cursor: "pointer",
  boxShadow:
    "0 2px 6px rgba(37, 99, 235, 0.2)",
};

const closeButtonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#334155",
  fontWeight: "700",
  fontSize: "12px",
  cursor: "pointer",
};

/*
 * ==================================================
 * ERROR
 * ==================================================
 */

const errorAlertStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  width: "100%",
  marginBottom: "22px",
  padding: "14px 16px",
  backgroundColor: "#fff7f7",
  border: "1px solid #fecaca",
  borderLeft: "4px solid #dc2626",
  borderRadius: "10px",
  boxShadow:
    "0 2px 8px rgba(220, 38, 38, 0.06)",
};

const errorIconStyle = {
  width: "24px",
  height: "24px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "800",
};

const errorContentStyle = {
  flex: 1,
  minWidth: 0,
};

const errorTitleStyle = {
  color: "#991b1b",
  fontSize: "13px",
  fontWeight: "800",
};

const errorMessageStyle = {
  marginTop: "3px",
  color: "#b91c1c",
  fontSize: "12px",
  lineHeight: "1.5",
};

const errorCloseButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#991b1b",
  fontSize: "20px",
  lineHeight: 1,
  cursor: "pointer",
  padding: "0 2px",
};

const smallErrorStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "14px",
  padding: "10px 12px",
  borderRadius: "8px",
  backgroundColor: "#fff7f7",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  fontSize: "11px",
};

const smallErrorIconStyle = {
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "800",
};

/*
 * ==================================================
 * LOADING
 * ==================================================
 */

const loadingCardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  padding: "40px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  boxShadow:
    "0 3px 12px rgba(15, 23, 42, 0.04)",
};

const loadingSpinnerStyle = {
  fontSize: "25px",
  color: "#2563eb",
};

const loadingTitleStyle = {
  color: "#334155",
  fontSize: "14px",
  fontWeight: "700",
};

const loadingMessageStyle = {
  marginTop: "3px",
  color: "#94a3b8",
  fontSize: "11px",
};

/*
 * ==================================================
 * EMPTY STATE
 * ==================================================
 */

const emptyStateStyle = {
  padding: "70px 25px",
  textAlign: "center",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow:
    "0 3px 12px rgba(15, 23, 42, 0.04)",
};

const emptyIconStyle = {
  width: "52px",
  height: "52px",
  margin: "0 auto 15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "14px",
  backgroundColor: "#eff6ff",
  color: "#2563eb",
  fontSize: "28px",
  fontWeight: "400",
};

const emptyTitleStyle = {
  margin: 0,
  color: "#172033",
  fontSize: "19px",
  fontWeight: "800",
};

const emptyMessageStyle = {
  maxWidth: "450px",
  margin: "8px auto 0",
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.6",
};

/*
 * ==================================================
 * EMPTY COLUMNS
 * ==================================================
 */

const emptyColumnsStyle = {
  padding: "35px",
  textAlign: "center",
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  border: "1px dashed #cbd5e1",
};

const emptyColumnsIconStyle = {
  color: "#94a3b8",
  fontSize: "24px",
};

const emptyColumnsTitleStyle = {
  marginTop: "5px",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "700",
};

const emptyColumnsMessageStyle = {
  marginTop: "3px",
  color: "#94a3b8",
  fontSize: "11px",
};

/*
 * ==================================================
 * SELECTED DATASET INFO
 * ==================================================
 */

const selectedInfoStyle = {
  marginTop: "20px",
  color: "#94a3b8",
  fontSize: "11px",
  textAlign: "right",
};

export default DatasetDiscoveryDashboard;