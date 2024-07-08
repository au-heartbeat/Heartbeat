import { useShareReportEffect } from '../../hooks/useShareReportEffect';
import ReportContent from '../ReportStep/ReportContent';
import { StyledPageContentWrapper } from './style';
import { useEffect } from 'react';

const ShareReport = () => {
  const { getData, reportInfos, dateRanges, metrics } = useShareReportEffect();

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
          startToRequestBoardData={getData}
          startToRequestDoraData={getData}
          hideButtons
        />
      )}
    </StyledPageContentWrapper>
  );
};

export default ShareReport;
