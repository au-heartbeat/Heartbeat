import { ReportDataWithThreeColumns } from '@src/hooks/reportMapper/reportUIDataStructure';
import { ClassificationResponse } from '@src/clients/report/dto/response';

export const classificationCardCountMapper = (
  classification: ClassificationResponse[],
): ReportDataWithThreeColumns[] => {
  return classification.map((it, index) => {
    const pairsValues = it.classificationInfos.map((classificationInfo) => {
      return {
        name: classificationInfo.name,
        value: `${classificationInfo.cardCount}`,
      };
    });
    return {
      id: index,
      name: it.fieldName,
      totalCount: it.totalCardCount,
      valueList: pairsValues,
    };
  });
};
