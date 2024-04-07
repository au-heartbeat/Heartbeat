import {
  selectCycleTimeWarningMessage,
  selectMetricsContent, selectTreatFlagCardAsBlock,
  updateTreatFlagCardAsBlock
} from '@src/context/Metrics/metricsSlice';
import { WarningNotification } from '@src/components/Common/WarningNotification';
import CycleTimeTable from '@src/containers/MetricsStep/CycleTime/Table';
import FlagCard from '@src/containers/MetricsStep/CycleTime/FlagCard';
import { TIPS } from '@src/constants/resources';
import { useAppSelector } from '@src/hooks';
import {useEffect, useState} from "react";
import {useAppDispatch} from "@src/hooks/useAppDispatch";
import SectionTitleWithTooltip from "@src/components/Common/SectionTitleWithTooltip";

export const CycleTime = () => {
  const dispatch = useAppDispatch();
  const [conflictMessage, setConflictMessage] = useState('');
  const flagCardAsBlock = useAppSelector(selectTreatFlagCardAsBlock);
  const warningMessage = useAppSelector(selectCycleTimeWarningMessage);
  const { cycleTimeSettings } = useAppSelector(selectMetricsContent);
  const hasBlockColumn = cycleTimeSettings.some(({ column }) => column === 'Blocked');

  useEffect(() => {
    if(hasBlockColumn && flagCardAsBlock) {
      setConflictMessage("Please note: ’consider the “Flag” as “Block” ‘ has been dropped!");
      dispatch(updateTreatFlagCardAsBlock(false));
    }
  }, [dispatch, cycleTimeSettings, flagCardAsBlock]);

  return (
    <div aria-label='Cycle time settings section'>
      {conflictMessage && <WarningNotification message={conflictMessage} />}
      <SectionTitleWithTooltip title='Board mappings' tooltipText={TIPS.CYCLE_TIME} />
      {warningMessage && <WarningNotification message={warningMessage} />}
      <CycleTimeTable />
      {hasBlockColumn || <FlagCard />}
    </div>
  );
};
