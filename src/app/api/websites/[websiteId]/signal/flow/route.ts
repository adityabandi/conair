import { parseRequest, getQueryFilters } from '@/lib/request';
import { json } from '@/lib/response';
import { getSignalFlow } from '@/queries/sql';

export async function GET(request: Request, { params }: { params: { websiteId: string } }) {
  const { websiteId } = params;

  const { query, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { startDate, endDate } = await getQueryFilters(query, websiteId);

  try {
    const data = await getSignalFlow(websiteId, startDate, endDate);
    return json(data);
  } catch {
    // Return empty array on error (e.g., if table doesn't exist yet)
    return json([]);
  }
}
