import {
  selectCycleTimeWarningMessage,
  selectMetricsContent,
  selectTreatFlagCardAsBlock,
  updateTreatFlagCardAsBlock,
} from '@src/context/Metrics/metricsSlice';
import SectionTitleWithTooltip from '@src/components/Common/SectionTitleWithTooltip';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import CycleTimeTable from '@src/containers/MetricsStep/CycleTime/Table';
import FlagCard from '@src/containers/MetricsStep/CycleTime/FlagCard';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { MESSAGE, TIPS } from '@src/constants/resources';
import { useAppSelector } from '@src/hooks';
import { useEffect, useState } from 'react';

export const CycleTime = () => {
  const dispatch = useAppDispatch();
  const flagCardAsBlock = useAppSelector(selectTreatFlagCardAsBlock);
  const warningMessage = useAppSelector(selectCycleTimeWarningMessage);
  const { cycleTimeSettings } = useAppSelector(selectMetricsContent);
  const hasBlockColumn = cycleTimeSettings.some(({ column }) => column === 'Blocked');
  const [shouldShowConflictMessage, setShouldShowConflictMessage] = useState(false);

  useEffect(() => {
    if (hasBlockColumn && flagCardAsBlock) {
      setShouldShowConflictMessage(true);
      dispatch(updateTreatFlagCardAsBlock(false));
    }
  }, [dispatch, cycleTimeSettings, flagCardAsBlock]);

  return (
    <div aria-label='Cycle time settings section'>
      {shouldShowConflictMessage && <WarningNotification message={MESSAGE.FLAG_CARD_DROPPED_WARNING} />}
      <SectionTitleWithTooltip title='Board mappings' tooltipText={TIPS.CYCLE_TIME} />
      {warningMessage && <WarningNotification message={warningMessage} />}
      <CycleTimeTable />
      {hasBlockColumn || <FlagCard />}
    </div>
  );
};
