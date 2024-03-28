import { MetricsTypeCheckbox } from '@src/containers/ConfigStep/MetricsTypeCheckbox';
import { closeAllNotifications } from '@src/context/notification/NotificationSlice';
import BasicInfo from '@src/containers/ConfigStep/BasicInfo';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { ConfigStepWrapper } from './style';
import Charts from '../ReportStep/Chart';
import { useLayoutEffect } from 'react';

const ConfigStep = () => {
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    dispatch(closeAllNotifications());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigStepWrapper>
      <BasicInfo />
      <Charts />
      <MetricsTypeCheckbox />
    </ConfigStepWrapper>
  );
};

export default ConfigStep;
