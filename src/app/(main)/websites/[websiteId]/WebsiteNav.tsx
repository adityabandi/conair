import { Text, Column } from '@/components/zen';
import {
  Eye,
  User,
  AlignEndHorizontal,
  Sparkles,
  FlaskConical,
  Activity,
  Lightbulb,
} from '@/components/icons';
import { Lightning, Target } from '@/components/svg';
import { useMessages, useNavigation } from '@/components/hooks';
import { SideMenu } from '@/components/common/SideMenu';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function WebsiteNav({
  websiteId,
  onItemClick,
}: {
  websiteId: string;
  onItemClick?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, teamId, router } = useNavigation();

  const renderPath = (path: string) =>
    renderUrl(`/websites/${websiteId}${path}`, {
      event: undefined,
      compare: undefined,
      view: undefined,
    });

  const items = [
    {
      label: 'Persona Intelligence',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <Eye />,
          path: renderPath(''),
        },
        {
          id: 'persona',
          label: 'Personas',
          icon: <Sparkles />,
          path: renderPath('/persona'),
        },
        {
          id: 'live',
          label: 'Live Feed',
          icon: <Activity />,
          path: renderPath('/live'),
        },
        {
          id: 'insights',
          label: 'Insights',
          icon: <Lightbulb />,
          path: renderPath('/insights'),
        },
        {
          id: 'experiments',
          label: 'Experiments',
          icon: <FlaskConical />,
          path: renderPath('/experiments'),
        },
      ],
    },
    {
      label: formatMessage(labels.traffic),
      items: [
        {
          id: 'overview',
          label: formatMessage(labels.overview),
          icon: <Eye />,
          path: renderPath('/traffic'),
        },
        {
          id: 'sessions',
          label: formatMessage(labels.sessions),
          icon: <User />,
          path: renderPath('/sessions'),
        },
        {
          id: 'events',
          label: formatMessage(labels.events),
          icon: <Lightning />,
          path: renderPath('/events'),
        },
        {
          id: 'goals',
          label: formatMessage(labels.goals),
          icon: <Target />,
          path: renderPath('/goals'),
        },
        {
          id: 'compare',
          label: formatMessage(labels.compare),
          icon: <AlignEndHorizontal />,
          path: renderPath('/compare'),
        },
      ],
    },
  ];

  const handleChange = (value: string) => {
    router.push(renderUrl(`/websites/${value}`));
  };

  const renderValue = (value: any) => {
    return (
      <Text truncate style={{ maxWidth: 160, lineHeight: 1 }}>
        {value?.selectedItem?.name}
      </Text>
    );
  };

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.endsWith(path.split('?')[0]))?.id;

  return (
    <Column padding="3" position="sticky" top="0" gap>
      <WebsiteSelect
        websiteId={websiteId}
        teamId={teamId}
        onChange={handleChange}
        renderValue={renderValue}
        buttonProps={{ style: { outline: 'none' } }}
      />
      <SideMenu
        items={items}
        selectedKey={selectedKey}
        allowMinimize={false}
        onItemClick={onItemClick}
      />
    </Column>
  );
}
