import { type NextPage } from 'next';
import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';
import { findDrawNextMonthCourt } from '@/src/app/_lib/db/draw';

const DrawPage = async () => {
  const drawList = await findDrawNextMonthCourt();
  return (
    <Flex direction="row" gap="md">
      <Navbar />
      <div>draw</div>
    </Flex>
  );
};

export default DrawPage;
