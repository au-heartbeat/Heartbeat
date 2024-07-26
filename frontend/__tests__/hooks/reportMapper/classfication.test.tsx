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
          value: 0.5714,
          cardCount: 1,
          storyPoints: 1,
        },
        {
          name: 'Operational Work - Planned',
          value: 0.3571,
          cardCount: 1,
          storyPoints: 1,
        },
        {
          name: 'Feature Work - Unplanned',
          value: 0.0714,
          cardCount: 1,
          storyPoints: 1,
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
          { name: 'Feature Work - Planned', value: '57.14%' },
          { name: 'Operational Work - Planned', value: '35.71%' },
          { name: 'Feature Work - Unplanned', value: '7.14%' },
        ],
      },
    ];
    const mappedClassifications = classificationMapper(mockClassificationRes);

    expect(mappedClassifications).toEqual(expectedClassificationValues);
  });
});
