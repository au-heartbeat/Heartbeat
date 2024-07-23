import { ErrorSectionWrapper, StyledPageContentWrapper } from './style';
import { useShareReportEffect } from '@src/hooks/useShareReportEffect';
import ReportContent from '../ReportStep/ReportContent';
import { MESSAGE } from '@src/constants/resources';
import ErrorSection from './ErrorSection';
import { useEffect } from 'react';

const getProjectName = () => {
  const searchString = window.location.href.split('?')[1];
  const searchParams = new URLSearchParams(searchString);
  const projectName = searchParams.get('projectName') || '';
  return decodeURI(projectName);
};

const ShareReport = () => {
  const { getData, reportInfos, dateRanges, metrics, isExpired, allPipelines, classificationNames } =
    useShareReportEffect();
  const projectName = getProjectName();

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
          classificationNames={classificationNames}
          allPipelines={allPipelines}
          dateRanges={dateRanges}
          reportInfos={reportInfos}
          startToRequestData={getData}
          projectName={projectName}
          hideButtons
        />
      </StyledPageContentWrapper>
    );
  } else {
    return;
  }
};

export default ShareReport;
