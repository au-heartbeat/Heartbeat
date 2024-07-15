import { ContextProvider } from '@src/hooks/useMetricsStepValidationCheckContext';
import { Notification } from '@src/components/Common/NotificationButton';
import ShareReport from '../containers/ShareReport';
import Header from '@src/layouts/Header';
import React from 'react';

const ShareReportPage = () => {
  return (
    <>
      <Header />
      <ContextProvider>
        <Notification />
        <ShareReport />
      </ContextProvider>
    </>
  );
};

export default ShareReportPage;
