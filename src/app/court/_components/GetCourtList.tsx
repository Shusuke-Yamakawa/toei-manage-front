/* eslint-disable no-restricted-syntax */

'use client';

import { Button, Checkbox, Flex, LoadingOverlay, Table } from '@mantine/core';
import { FC, useState } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { GetCourt } from '@/src/app/_lib/db/getCourt';
import { Card } from '@/src/app/_lib/db/card';

const deleteGetCourtById = async (id: number) =>
  axios.delete(`http://localhost:3003/court/api/byWeb/${id}`);

const getGetCourtByWeb = async () => {
  await axios.get('http://localhost:3003/court/api/byWeb/');
  window.location.reload();
};

type Props = {
  data: ({ id: number } & GetCourt & { card: Card })[];
};

export const GetCourtList: FC<Props> = ({ data }) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [visible, { toggle, close }] = useDisclosure(false);
  const deleteCourt = async () => {
    for (const id of selectedRows) {
      try {
        await deleteGetCourtById(id);
      } catch (error) {
        console.error(`Failed to delete court with ID: ${id}`);
        notifications.show({
          color: 'red',
          title: 'エラーが発生',
          message: 'キャンセル処理で失敗しました',
        });
        // break;
      }
    }
    close();
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
      <Table.Td>{d.hold_flg ? '開催' : '未定'}</Table.Td>
    </Table.Tr>
  ));
  return (
    <Flex direction="column" gap="md" m="lg">
      <Button
        onClick={async () => {
          toggle();
          await deleteCourt();
        }}
        variant="light"
      >
        削除
      </Button>
      <Button
        onClick={async () => {
          toggle();
          await getGetCourtByWeb();
        }}
        variant="light"
      >
        再取得
      </Button>
      <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
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
            <Table.Th>開催設定</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Flex>
  );
};
