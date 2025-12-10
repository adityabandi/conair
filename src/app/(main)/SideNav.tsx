import { Key } from 'react';
import Link from 'next/link';
import { Sidebar, SidebarSection, SidebarItem, SidebarHeader, Row } from '@/components/ui';
import { Globe, PanelLeft } from '@/components/icons';
import { Logo } from '@/components/svg';
import { useMessages, useNavigation, useGlobalState } from '@/components/hooks';
import { NavButton } from '@/components/input/NavButton';
import { PanelButton } from '@/components/input/PanelButton';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function SideNav(props: any) {
  const { formatMessage, labels } = useMessages();
  const { pathname, renderUrl, websiteId, router } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');

  const hasNav = !!(websiteId || pathname.startsWith('/admin') || pathname.includes('/settings'));

  const handleSelect = (id: Key) => {
    router.push(id === 'user' ? '/websites' : `/teams/${id}/websites`);
  };

  return (
    <Sidebar {...props} isCollapsed={isCollapsed || hasNav}>
      <SidebarSection onClick={() => setIsCollapsed(false)}>
        <SidebarHeader
          label="Signal"
          icon={isCollapsed && !hasNav ? <PanelLeft /> : <Logo />}
          style={{ maxHeight: 40 }}
        >
          {!isCollapsed && !hasNav && <PanelButton />}
        </SidebarHeader>
      </SidebarSection>
      <SidebarSection style={{ paddingTop: 0, paddingBottom: 0, justifyContent: 'center' }}>
        <NavButton showText={!hasNav && !isCollapsed} onAction={handleSelect} />
      </SidebarSection>
      <SidebarSection style={{ flexGrow: 1 }}>
        <Link href={renderUrl('/websites', false)} role="button">
          <SidebarItem
            label={formatMessage(labels.websites)}
            icon={<Globe />}
            isSelected={pathname.includes('/websites')}
            role="button"
          />
        </Link>
      </SidebarSection>
      <SidebarSection style={{ justifyContent: 'flex-start' }}>
        <Row style={{ flexWrap: 'wrap' }}>
          <ThemeToggle />
        </Row>
      </SidebarSection>
    </Sidebar>
  );
}
