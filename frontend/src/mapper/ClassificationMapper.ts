import { ClassificationResp } from '../models/response/reportResp'
import { ReportDataWithThreeColumns } from '@src/models/reportUIDataStructure'

export const classificationMapper = (classification: ClassificationResp[]) => {
  const mappedClassificationValue: ReportDataWithThreeColumns[] = []

  classification.map((item) => {
    const classificationValue: ReportDataWithThreeColumns = {
      id: mappedClassificationValue.length + 1,
      name: item.fieldName,
      values: item.pairs,
    }
    mappedClassificationValue.push(classificationValue)
  })

  return mappedClassificationValue
}
