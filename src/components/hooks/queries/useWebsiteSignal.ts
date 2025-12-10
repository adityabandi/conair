import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useWebsiteSignal(websiteId: string) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useDateParameters();
  const queryParams = useFilterParameters();

  return useQuery({
    queryKey: ['websites:signal:flow', { websiteId, startAt, endAt, ...queryParams }],
    queryFn: () =>
      get(`/websites/${websiteId}/signal/flow`, {
        startAt,
        endAt,
        ...queryParams,
      }),
    enabled: !!websiteId,
  });
}
