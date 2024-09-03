import {
  savePipelineCrews,
  saveSourceControlCrews,
  saveUsers,
  selectMetricsContent,
} from '@src/context/Metrics/metricsSlice';
import { AssigneeFilter } from '@src/containers/MetricsStep/Crews/AssigneeFilter';
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import MultiAutoComplete from '@src/components/Common/MultiAutoComplete';
import { WarningMessage } from '@src/containers/MetricsStep/Crews/style';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import React, { useEffect, useState } from 'react';
import { FormHelperText } from '@mui/material';
import { useAppSelector } from '@src/hooks';

interface crewsProps {
  options: string[];
  title: string;
  label: string;
  type?: string;
}

function getValidSelectedCrews(configCrews: string[], realCrews: string[]): string[] {
  return configCrews.filter((crew: string): boolean => realCrews.includes(crew));
}

export const Crews = ({ options, title, label, type = 'board' }: crewsProps) => {
  const isBoardCrews = type === 'board';
  const isSourceControl = type === 'source-control';
  const dispatch = useAppDispatch();
  const { users, pipelineCrews, sourceControlCrews } = useAppSelector(selectMetricsContent);
  const crews = isSourceControl
    ? getValidSelectedCrews(sourceControlCrews, options)
    : getValidSelectedCrews(pipelineCrews, options);
  const [selectedCrews, setSelectedCrews] = useState<string[]>(isBoardCrews ? users : crews);
  const isAllSelected = options.length > 0 && selectedCrews.length === options.length;
  const isEmptyCrewData = selectedCrews.length === 0;

  useEffect(() => {
    const crews = isSourceControl ? sourceControlCrews : pipelineCrews;
    setSelectedCrews(isBoardCrews ? users : crews);
  }, [users, isBoardCrews, pipelineCrews, isSourceControl, sourceControlCrews]);

  const handleCrewChange = (_: React.SyntheticEvent, value: string[]) => {
    if (value[value.length - 1] === 'All') {
      setSelectedCrews(selectedCrews.length === options.length ? [] : options);
      return;
    }
    setSelectedCrews([...value]);
  };

  useEffect(() => {
    const crew = isSourceControl ? saveSourceControlCrews(selectedCrews) : savePipelineCrews(selectedCrews);
    dispatch(isBoardCrews ? saveUsers(selectedCrews) : crew);
  }, [selectedCrews, dispatch, isBoardCrews, isSourceControl]);

  return (
    <>
      <MetricsSettingTitle title={title} />
      <MultiAutoComplete
        ariaLabel='Included Crews multiple select'
        optionList={options}
        isError={isEmptyCrewData && isBoardCrews}
        isSelectAll={isAllSelected}
        onChangeHandler={handleCrewChange}
        selectedOption={selectedCrews}
        textFieldLabel={label}
        isBoardCrews={isBoardCrews}
      />
      {isBoardCrews && <AssigneeFilter />}
      <FormHelperText>
        {isEmptyCrewData && isBoardCrews && (
          <WarningMessage>
            {label} is <strong>required</strong>
          </WarningMessage>
        )}
      </FormHelperText>
    </>
  );
};
