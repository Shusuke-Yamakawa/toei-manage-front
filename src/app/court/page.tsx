'use client';

import { type NextPage } from 'next';
import { Button, Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';
// import { login } from '@/src/app/_utils/login';

const getCourtList = () => {
  fetch('http://localhost:3003/court/get', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((data) => console.log(data));
};

const CourtPage: NextPage = () => (
  <Flex direction="row" gap="md">
    <Navbar />
    <Button onClick={getCourtList} mt="md" variant="light">
      getCourtList
    </Button>
  </Flex>
);

export default CourtPage;
