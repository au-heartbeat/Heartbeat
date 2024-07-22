import { ErrorSectionWrapper, StyledPageContentWrapper } from './style';
import { useShareReportEffect } from '@src/hooks/useShareReportEffect';
import ReportContent from '../ReportStep/ReportContent';
import { MESSAGE } from '@src/constants/resources';
import ErrorSection from './ErrorSection';
import { useEffect } from 'react';

const ShareReport = () => {
  const { getData, reportInfos, dateRanges, metrics, isExpired, allPipelines, classificationCharts } =
    useShareReportEffect();

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
          isSharePage
          metrics={metrics}
          classificationCharts={classificationCharts}
          allPipelines={allPipelines}
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
