// import puppeteer from 'puppeteer';
import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';
import { findCardAll } from '@/src/app/_lib/db/card';
import { CardList } from '@/src/app/card/_components/CardList';

export default async function CardPage() {
  const card = await findCardAll();
  return (
    <Flex direction="row" gap="md">
      <Navbar />
      <CardList data={card} />
    </Flex>
  );
}
