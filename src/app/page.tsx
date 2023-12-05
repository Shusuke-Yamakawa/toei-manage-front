// import puppeteer from 'puppeteer';
import { Navbar } from '@/src/app/_layouts';
import { Flex } from '@mantine/core';

export default function HomePage() {
  return (
    <Flex direction="row" gap="md">
      <Navbar />
      <div>toei</div>
    </Flex>
  );
}
