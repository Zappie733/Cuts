export interface GetStoresByStatusQueryParams {
  limit: number;
  offset: number;
  status: "Waiting for Approval" | "Rejected" | "Active" | "InActive" | "Hold";
  search: string;
}
