import { type NextPage } from 'next';
import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';

const DrawPage: NextPage = () => (
  <Flex direction="row" gap="md">
    <Navbar />
    <div>draw</div>
  </Flex>
);

export default DrawPage;
