import {
  selectCycleTimeWarningMessage, selectDisplayFlagCardAsBlock,
  selectMetricsContent,
  selectTreatFlagCardAsBlock, updateDisplayFlagCardAsBlock,
  updateTreatFlagCardAsBlock,
} from '@src/context/Metrics/metricsSlice';
import SectionTitleWithTooltip from '@src/components/Common/SectionTitleWithTooltip';
import { CYCLE_TIME_SETTINGS_TYPES, MESSAGE, TIPS } from '@src/constants/resources';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import CycleTimeTable from '@src/containers/MetricsStep/CycleTime/Table';
import FlagCard from '@src/containers/MetricsStep/CycleTime/FlagCard';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { useAppSelector } from '@src/hooks';
import { useEffect, useState } from 'react';

export const CycleTime = () => {
  const dispatch = useAppDispatch();
  const flagCardAsBlock = useAppSelector(selectTreatFlagCardAsBlock);
  const displayFlagCardAsBlock = useAppSelector(selectDisplayFlagCardAsBlock);
  const warningMessage = useAppSelector(selectCycleTimeWarningMessage);
  const { cycleTimeSettings, cycleTimeSettingsType } = useAppSelector(selectMetricsContent);
  const hasBlockColumn =
    cycleTimeSettingsType === CYCLE_TIME_SETTINGS_TYPES.BY_COLUMN
      ? cycleTimeSettings.some(({ column }) => column.toUpperCase() === 'BLOCKED' || column.toUpperCase() === 'BLOCK')
      : cycleTimeSettings.some(({ status }) => status.toUpperCase() === 'BLOCKED' || status.toUpperCase() === 'BLOCK');
  const [shouldShowConflictMessage, setShouldShowConflictMessage] = useState(false);

  useEffect(() => {
    if (hasBlockColumn && flagCardAsBlock && displayFlagCardAsBlock) {
      setShouldShowConflictMessage(true);
      dispatch(updateTreatFlagCardAsBlock(false));
      dispatch(updateDisplayFlagCardAsBlock(false));
    }
    // if(hasBlockColumn && displayFlagCardAsBlock) {
    //
    // }
    // if(!hasBlockColumn) {
    //   dispatch(updateTreatFlagCardAsBlock(true));
    // }
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
