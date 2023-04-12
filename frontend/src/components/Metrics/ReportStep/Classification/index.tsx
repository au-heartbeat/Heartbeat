import ReportForThreeColumns from '@src/components/Common/ReportForThreeColumns'

interface ClassificationProps {
  title: string
  classificationData: ReportDataWithThreeColumns[]
}

export const Classification = ({ title, classificationData }: ClassificationProps) => (
  <ReportForThreeColumns title={title} fieldName='Field Name' listName='Subtitle' data={classificationData} />
)
