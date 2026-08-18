import apiClient from "./client";

export function uploadDataset(file) {
  const formData = new FormData();

  formData.append("file", file);

  return apiClient.post("/datasets", formData);
}

export function getDatasets() {
  return apiClient.get("/datasets");
}


export function getDataset(id) {
  return apiClient.get(`/datasets/${id}`);
}

export async function updateDatasetColumnClassification(
  datasetId,
  columnId,
  sensitivityTag
) {
  return apiClient.patch(
    `/datasets/${datasetId}/dataset_columns/${columnId}`,
    {
      sensitivity_tag: sensitivityTag,
    }
  );
}