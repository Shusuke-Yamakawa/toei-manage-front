/* eslint-disable no-restricted-syntax */

'use client';

import { Button, Checkbox, Flex, Table } from '@mantine/core';
import { FC, useState } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { Card } from '@/src/app/_lib/db/card';
import { Draw } from '@/src/app/_lib/db/draw';

const deleteDrawById = async (id: number) =>
  axios.delete(`http://localhost:3003/court/api/byWeb/${id}`);

const getDrawByWeb = async () => {
  axios.get('http://localhost:3003/court/api/byWeb/');
  window.location.reload();
};

type Props = {
  data: ({ id: number } & Draw & { card: Card })[];
};

export const GetCourtList: FC<Props> = ({ data }) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const deleteDraw = async () => {
    for (const id of selectedRows) {
      try {
        await deleteDrawById(id);
      } catch (error) {
        console.error(`Failed to delete court with ID: ${id}`);
        notifications.show({
          color: 'red',
          title: 'エラーが発生',
          message: 'キャンセル処理で失敗しました',
        });
        break;
      }
    }
    notifications.show({
      color: 'blue',
      title: '完了',
      message: 'キャンセル処理が完了しました',
    });
    // リフェッチする
    window.location.reload();
  };
  // const deleteCourtTest = async () => {
  //   notifications.show({
  //     color: 'blue',
  //     title: '完了',
  //     message: 'キャンセル処理が完了しました',
  //   });
  // };
  console.log('selectedRows: ', selectedRows);
  const rows = data.map((d) => (
    <Table.Tr
      key={d.id}
      bg={selectedRows.includes(d.id) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(d.id)}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, d.id]
                : selectedRows.filter((position) => position !== d.id)
            )
          }
        />
      </Table.Td>
      <Table.Td>{d.month}</Table.Td>
      <Table.Td>{d.day}</Table.Td>
      <Table.Td>{d.from_time}</Table.Td>
      <Table.Td>{d.to_time}</Table.Td>
      <Table.Td>{d.court}</Table.Td>
      <Table.Td>{d.card_id}</Table.Td>
      <Table.Td>{d.card.password}</Table.Td>
      <Table.Td>{d.card.user_nm}</Table.Td>
    </Table.Tr>
  ));
  return (
    <Flex direction="column" gap="md" m="lg">
      <Button onClick={deleteDraw} variant="light">
        削除
      </Button>
      <Button onClick={getDrawByWeb} variant="light">
        再取得
      </Button>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>削除</Table.Th>
            <Table.Th>月</Table.Th>
            <Table.Th>日付</Table.Th>
            <Table.Th>開始時間</Table.Th>
            <Table.Th>終了時間</Table.Th>
            <Table.Th>コート名</Table.Th>
            <Table.Th>カードID</Table.Th>
            <Table.Th>パスワード</Table.Th>
            <Table.Th>カード名義</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Flex>
  );
};
