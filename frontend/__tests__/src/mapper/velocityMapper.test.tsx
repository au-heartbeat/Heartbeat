import { VelocityMetric } from '../fixtures'
import { velocityMapper } from '@src/mapper/VelocityMapper'

describe('velocity data mapper', () => {
  it('maps response velocity values to ui display value', () => {
    const mockVelocityRes = {
      velocityForSP: '20',
      velocityForCards: '15',
    }
    const expectedVelocityValues = {
      [VelocityMetric.VELOCITY_SP]: '20',
      [VelocityMetric.THROUGHPUT_CARDS_COUNT]: '15',
    }

    const mappedVelocityValues = velocityMapper(mockVelocityRes)

    expect(mappedVelocityValues).toEqual(expectedVelocityValues)
  })
})
