import { ReportDataForMultipleValueColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { ClassificationResponse } from '@src/clients/report/dto/response';

export const classificationMapper = (classification: ClassificationResponse[]) => {
  const mappedClassificationValue: ReportDataForMultipleValueColumns[] = [];

  classification.map((item, index) => {
    const pairsValues: { name: string; values: string[] }[] = [];

    item.classificationInfos.map((pairItem) => {
      pairsValues.push({
        name: pairItem.name,
        values: [`${(pairItem.cardCountValue * 100).toFixed(2)}%`, `${(pairItem.storyPointsValue * 100).toFixed(2)}%`],
      });
    });

    const classificationValue: ReportDataForMultipleValueColumns = {
      id: index,
      name: item.fieldName,
      valueList: pairsValues,
    };
    mappedClassificationValue.push(classificationValue);
  });

  return mappedClassificationValue;
};
