'use client';
import { Column } from '@/components/zen';
import { PageHeader } from '@/components/common/PageHeader';
import { PageBody } from '@/components/common/PageBody';
import { BoardAddButton } from './BoardAddButton';

export function BoardsPage() {
  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title="My Boards">
          <BoardAddButton />
        </PageHeader>
      </Column>
    </PageBody>
  );
}
