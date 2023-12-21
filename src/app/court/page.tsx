import { Flex } from '@mantine/core';
import { Navbar } from '@/src/app/_layouts';
import { findGetCourtOverCurrentCourt } from '@/src/app/_lib/db/getCourt';
import { GetCourtList } from '@/src/app/court/_components/GetCourtList';

const CourtPage = async () => {
  const getCourtList = await findGetCourtOverCurrentCourt();
  // console.log('getCourtList: ', getCourtList);
  return (
    <Flex direction="row" gap="md">
      <Navbar />
      <GetCourtList data={getCourtList} />
    </Flex>
  );
};

export default CourtPage;
