/* eslint-disable no-restricted-syntax */

'use client';

import { Button, Checkbox, Flex, Table } from '@mantine/core';
import { FC, useState } from 'react';
import { Card } from '@/src/app/_lib/db/card';

type Props = {
  data: Card[];
};

export const CardList: FC<Props> = ({ data }) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const rows = data.map((d) => (
    <Table.Tr
      key={d.card_id}
      bg={selectedRows.includes(Number(d.card_id)) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(Number(d.card_id))}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, Number(d.card_id)]
                : selectedRows.filter((position) => position !== Number(d.card_id))
            )
          }
        />
      </Table.Td>
      <Table.Td>{d.card_id}</Table.Td>
      <Table.Td>{d.password}</Table.Td>
      <Table.Td>{d.user_nm}</Table.Td>
      <Table.Td>{d.available_flg ? '有効' : '無効'}</Table.Td>
      <Table.Td>{d.note}</Table.Td>
      <Table.Td>{d.draw_flg ? '抽選前' : '抽選済'}</Table.Td>
    </Table.Tr>
  ));
  return (
    <Flex direction="column" gap="md" m="lg">
      <Button variant="light">削除</Button>
      <Button variant="light">更新予定</Button>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>削除</Table.Th>
            <Table.Th>カードID</Table.Th>
            <Table.Th>パスワード</Table.Th>
            <Table.Th>カード名義</Table.Th>
            <Table.Th>有効</Table.Th>
            <Table.Th>備考</Table.Th>
            <Table.Th>抽選可能</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Flex>
  );
};
