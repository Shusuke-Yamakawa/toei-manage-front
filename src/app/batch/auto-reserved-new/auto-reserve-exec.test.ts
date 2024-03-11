import { shouldReserve } from '@/src/app/batch/auto-reserved-new/auto-reserve-exec';

// 実行時のコート取得状況やDESIRED_RESERVATION_DATE_LISTに依存するため、常にテストが通るわけではない
describe('===auto-reserve-exec', () => {
  it('コート取得期限を超えている場合、shouldReserveはfalseになる', async () => {
    expect(await shouldReserve(2024, 3, 16, '9')).toBe(false);
  });
  it('コート取得件数が1以上の場合、shouldReserveはtrueになる', async () => {
    expect(await shouldReserve(2024, 3, 23, '13')).toBe(false);
  });
  it('コート取得件数が0の場合、shouldReserveはtrueになる', async () => {
    expect(await shouldReserve(2024, 3, 21, '11')).toBe(true);
  });
  it('ターゲット時間が9時の場合、shouldReserveはtrueになる', async () => {
    expect(await shouldReserve(2024, 3, 23, '9')).toBe(true);
  });
  it('DESIRED_RESERVATION_DATE_LISTに含まれている場合、shouldReserveはtrueになる', async () => {
    expect(await shouldReserve(2024, 3, 19, '13')).toBe(true);
  });
});
