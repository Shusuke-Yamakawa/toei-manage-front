// import puppeteer from 'puppeteer';
import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';

export default function HomePage() {
  return (
    <Flex direction="row" gap="md">
      <Navbar />
      <div>card</div>
    </Flex>
  );
}
