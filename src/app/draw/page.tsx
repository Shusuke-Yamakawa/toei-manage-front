import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';
import { findDrawNextMonthCourt } from '@/src/app/_lib/db/draw';
import { DrawList } from '@/src/app/draw/_components/DrawList';
import { findCardCanDraw } from '@/src/app/_lib/db/card';

const DrawPage = async () => {
  const drawList = await findDrawNextMonthCourt();
  const cardCanDraw = await findCardCanDraw();

  return (
    <Flex direction="row" gap="md">
      <Navbar />
      <DrawList draws={drawList} cardCanDraw={cardCanDraw} />
    </Flex>
  );
};

export default DrawPage;
