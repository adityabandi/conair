import { useApp, setUser } from '@/store/app';
import { useApi } from '../useApi';

const selector = (state: { user: any }) => state.user;

// Mock user for when auth is disabled
const ANONYMOUS_USER = {
  id: 'anonymous',
  username: 'anonymous',
  role: 'admin',
  isAdmin: true,
  teams: [],
};

export function useLoginQuery() {
  const { post, useQuery } = useApi();
  const user = useApp(selector);

  const query = useQuery({
    queryKey: ['login'],
    queryFn: async () => {
      try {
        const data = await post('/auth/verify');
        setUser(data);
        return data;
      } catch {
        // Auth failed - use anonymous user (auth disabled mode)
        setUser(ANONYMOUS_USER);
        return ANONYMOUS_USER;
      }
    },
    enabled: !user,
    retry: false,
  });

  return { user: user || ANONYMOUS_USER, setUser, ...query };
}
