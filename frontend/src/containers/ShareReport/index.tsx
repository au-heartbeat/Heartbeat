import { useShareReportEffect } from '../../hooks/useShareReportEffect';
import { ErrorSectionWrapper, StyledPageContentWrapper } from './style';
import ReportContent from '../ReportStep/ReportContent';
import { MESSAGE } from '../../constants/resources';
import ErrorSection from './ErrorSection';
import { useEffect } from 'react';

const ShareReport = () => {
  const { getData, reportInfos, dateRanges, metrics, isExpired } = useShareReportEffect();

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isExpired) {
    return (
      <StyledPageContentWrapper>
        <ErrorSectionWrapper>
          <ErrorSection message={MESSAGE.SHARE_REPORT_EXPIRED} />
        </ErrorSectionWrapper>
      </StyledPageContentWrapper>
    );
  } else if (reportInfos.length > 0) {
    return (
      <StyledPageContentWrapper>
        <ReportContent
          metrics={metrics}
          dateRanges={dateRanges}
          reportInfos={reportInfos}
          startToRequestData={getData}
          hideButtons
        />
      </StyledPageContentWrapper>
    );
  } else {
    return;
  }
};

export default ShareReport;
