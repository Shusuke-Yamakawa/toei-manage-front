/* eslint-disable no-restricted-syntax */

'use client';

import {
  Button,
  Checkbox,
  Flex,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Table,
  Text,
} from '@mantine/core';
import { FC, useState } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { Card } from '@/src/app/_lib/db/card';
import { Draw } from '@/src/app/_lib/db/draw';

const deleteDrawById = async (id: number) =>
  axios.delete(`http://localhost:3003/draw/api/byWeb/${id}`);

const drawConfirm = async () => axios.put('http://localhost:3003/draw/api/byWeb/');

type Props = {
  draws: ({ id: number } & Draw & { card: Card })[];
  cardCanDraw: Card[];
};

export const DrawList: FC<Props> = ({ draws, cardCanDraw }) => {
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
  const rows = draws.map((d) => (
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
  const [opened, { open, close }] = useDisclosure(false);
  const [visible, { toggle }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      day: 1,
      fromTime: 9,
      toTime: 11,
      court: '井の頭恩賜公園',
      drawCount: 6,
    },
  });
  return (
    <Flex direction="column" gap="md" m="lg">
      <Button onClick={deleteDraw} variant="light">
        削除
      </Button>
      <Modal opened={opened} onClose={close} title="抽選">
        <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <form
          onSubmit={form.onSubmit(async (values) => {
            try {
              toggle();
              await axios.post('http://localhost:3003/draw/api/byWeb/', values);
            } catch (error) {
              notifications.show({
                color: 'red',
                title: 'エラーが発生',
                message: '抽選処理で失敗しました',
              });
            }
            // toggle();
            window.location.reload();
          })}
        >
          <Text>{cardCanDraw.length}人</Text>
          <NumberInput mt={8} label="日にち" {...form.getInputProps('day')} />
          <NumberInput label="開始時間" {...form.getInputProps('fromTime')} />
          <NumberInput label="終了時間" {...form.getInputProps('toTime')} />
          <Select
            label="コート名"
            data={['井の頭恩賜公園', '野川公園', '小金井公園', '府中の森公園']}
            {...form.getInputProps('court')}
          />
          <NumberInput label="抽選人数" {...form.getInputProps('drawCount')} />
          <Button mt={16} type="submit" variant="light">
            抽選実行
          </Button>
        </form>
      </Modal>
      <Button onClick={open} variant="light">
        抽選
      </Button>
      <Button onClick={drawConfirm} variant="light">
        抽選確認
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
