import { api } from "./api";
import type { DashboardDTO } from "../types/dashboard";

export type RangeKey = "THIS_MONTH" | "LAST_MONTH" | "THIS_YEAR";

export const dashboardService = {
  async getOverview(range: RangeKey): Promise<DashboardDTO> {
    const res = await api.get(`/dashboard/overview?range=${range}`);
    // nếu axios trả res.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res as any).data ?? res;
  },
};
