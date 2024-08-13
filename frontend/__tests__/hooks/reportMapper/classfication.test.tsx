import { classificationMapper } from '@src/hooks/reportMapper/classification';

describe('classification data mapper', () => {
  const mockClassificationRes = [
    {
      fieldName: 'FS Work Type',
      totalCardCount: 3,
      storyPoints: 3,
      classificationInfos: [
        {
          name: 'Feature Work - Planned',
          cardCountValue: 0.5714,
          cardCount: 1,
          storyPoints: 1,
          storyPointsValue: 0.1,
        },
        {
          name: 'Operational Work - Planned',
          cardCountValue: 0.3571,
          cardCount: 1,
          storyPoints: 1,
          storyPointsValue: 0.1,
        },
        {
          name: 'Feature Work - Unplanned',
          cardCountValue: 0.0714,
          cardCount: 1,
          storyPoints: 1,
          storyPointsValue: 0.1,
        },
      ],
    },
  ];
  it('maps response Classification values to ui display value', () => {
    const expectedClassificationValues = [
      {
        id: 0,
        name: 'FS Work Type',
        valueList: [
          { name: 'Feature Work - Planned', values: ['57.14%', '10.00%'] },
          { name: 'Operational Work - Planned', values: ['35.71%', '10.00%'] },
          { name: 'Feature Work - Unplanned', values: ['7.14%', '10.00%'] },
        ],
      },
    ];
    const mappedClassifications = classificationMapper(mockClassificationRes);

    expect(mappedClassifications).toEqual(expectedClassificationValues);
  });
});
