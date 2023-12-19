'use client';

import { Button, Flex } from '@mantine/core';
import axios from 'axios';

const autoReserve = async () => axios.get('http://localhost:3003/batch/auto-reserved?from=9&to=11');
const loginTest = async () =>
  axios.get('http://localhost:3003/batch/api/login?id=84808001&password=19841007');

export const BatchView = () => (
  <Flex direction="column" gap="md" m="lg">
    <Button onClick={autoReserve} variant="light">
      autoReserve
    </Button>
    <Button onClick={loginTest} variant="light">
      login
    </Button>
  </Flex>
);
