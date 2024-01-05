import Header from '@src/layouts/Header';
import MetricsStepper from '@src/components/Metrics/MetricsStepper';
import { ContextProvider } from '@src/hooks/useMetricsStepValidationCheckContext';
import { useNotificationLayoutEffect } from '@src/hooks/useNotificationLayoutEffect';
import { Notification } from '@src/components/Common/NotificationButton';

const Metrics = () => {
  const props = useNotificationLayoutEffect();

  return (
    <>
      <Header />
      <ContextProvider>
        <Notification {...props} />
        <MetricsStepper {...props} />
      </ContextProvider>
    </>
  );
};

export default Metrics;
