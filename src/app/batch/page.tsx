'use client';

import { type NextPage } from 'next';
import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';
import { BatchView } from '@/src/app/batch/_components/BatchView';

const BatchPage: NextPage = () => (
  <Flex direction="row" gap="md">
    <Navbar />
    <BatchView />
  </Flex>
);

export default BatchPage;
