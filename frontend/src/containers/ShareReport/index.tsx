import { useShareReportEffect } from '../../hooks/useShareReportEffect';
import ReportContent from '../ReportStep/ReportContent';
import { StyledPageContentWrapper } from './style';
import { useEffect } from 'react';
import { metrics } from './mock';

const ShareReport = () => {
  const { getData, reportInfos, dateRanges } = useShareReportEffect();

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledPageContentWrapper>
      {reportInfos.length > 0 && (
        <ReportContent
          metrics={metrics}
          dateRanges={dateRanges}
          reportInfos={reportInfos}
          startToRequestBoardData={() => getData()}
          startToRequestDoraData={() => getData()}
          hideButtons
        />
      )}
    </StyledPageContentWrapper>
  );
};

export default ShareReport;
