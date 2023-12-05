'use client';

import { type NextPage } from 'next';
import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';

const BatchPage: NextPage = () => (
  <Flex direction="row" gap="md">
    <Navbar />
  </Flex>
);

export default BatchPage;
