import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';
import { findGetCourtMany, findGetCourtOverCurrentCourt } from '@/src/app/_lib/db/getCourt';
import { GetCourtList } from '@/src/app/court/_components/GetCourtList';

const CourtPage = async () => {
  const getCourtList = await findGetCourtMany();
  return (
    <Flex direction="row" gap="md">
      <Navbar />
      <GetCourtList data={getCourtList} />
    </Flex>
  );
};

export default CourtPage;
