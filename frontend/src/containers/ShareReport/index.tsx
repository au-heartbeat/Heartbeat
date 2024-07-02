import {
  csvTimeStamp,
  dateRanges,
  handleSave,
  metrics,
  reportInfos,
  startToRequestBoardData,
  startToRequestDoraData,
} from './mock';
import ReportContent from '../ReportStep/ReportContent';
import { StyledPageContentWrapper } from './style';
import { useParams } from 'react-router-dom';

const ShareReport = () => {
  const { reportId } = useParams();
  const reportContentProps = {
    metrics,
    dateRanges,
    startToRequestDoraData,
    startToRequestBoardData,
    reportInfos,
    handleSave,
    csvTimeStamp,
  };
  return (
    <StyledPageContentWrapper>
      <ReportContent {...reportContentProps} hideButtons />
    </StyledPageContentWrapper>
  );
};

export default ShareReport;
