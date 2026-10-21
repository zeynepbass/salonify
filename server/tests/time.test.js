import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addDays,
  buildSlotKeys,
  getDayOfWeek,
  getSalonNow,
  getWeekRange,
  isValidDateString,
  rangesOverlap,
  timeToMinutes,
} from '../src/utils/time.js';

describe('time utils', () => {
  it('takvimde olmayan tarihleri reddeder', () => {
    assert.equal(isValidDateString('2026-10-09'), true);
    assert.equal(isValidDateString('2026-02-31'), false);
    assert.equal(isValidDateString('09-10-2026'), false);
  });

  it('gün ve hafta hesaplarını saat diliminden bağımsız yapar', () => {
    assert.equal(getDayOfWeek('2026-10-07'), 3);
    assert.equal(addDays('2026-10-31', 1), '2026-11-01');
    assert.deepEqual(getWeekRange('2026-10-11'), { from: '2026-10-05', to: '2026-10-11' });
  });

  it('"şu an"ı salonun saat dilimine göre hesaplar', () => {
    const now = getSalonNow(new Date('2026-10-07T22:30:00Z'));
    assert.deepEqual(now, { date: '2026-10-08', time: '01:30', minutes: 90 });
  });

  it('bitişik aralıkları çakışma saymaz', () => {
    assert.equal(rangesOverlap(600, 660, 660, 720), false);
    assert.equal(rangesOverlap(600, 660, 630, 690), true);
  });

  it('randevunun kapladığı bütün dilimleri üretir', () => {
    assert.deepEqual(buildSlotKeys(timeToMinutes('09:00'), timeToMinutes('09:45')), ['09:00', '09:30']);
    assert.deepEqual(buildSlotKeys(timeToMinutes('10:00'), timeToMinutes('11:00')), ['10:00', '10:30']);
  });
});
