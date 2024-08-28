import { BranchSelectionWrapper } from '@src/containers/MetricsStep/DeploymentFrequencySettings/PipelineMetricSelection/style';
import BranchChip from '@src/containers/MetricsStep/DeploymentFrequencySettings/BranchSelection/BranchChip';
import { selectSourceControlConfigurationSettings } from '@src/context/Metrics/metricsSlice';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { FormFieldWithMeta } from '@src/context/meta/metaSlice';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { useAppSelector } from '@src/hooks';
import React, { useCallback } from 'react';

export interface BranchSelectionProps {
  id: number;
  branches: string[];
  onUpdate: (id: number, label: string, value: string[]) => void;
}

export const SourceControlBranch = (props: BranchSelectionProps) => {
  const { id, branches, onUpdate } = props;
  const sourceControlList = useAppSelector(selectSourceControlConfigurationSettings);

  const selectedBranches = sourceControlList.find((it) => it.id === id)?.branches;

  const handleBranchChange = (_: React.SyntheticEvent, values: string[]) => {
    onUpdate(id, 'Branches', values);
  };

  return (
    <BranchSelectionWrapper>
      <Autocomplete
        aria-label='Source control Branch AutoComplete'
        multiple
        options={branches}
        disableCloseOnSelect
        value={selectedBranches}
        onChange={handleBranchChange}
        getOptionLabel={(option) => option}
        isOptionEqualToValue={(option, selected) => option === selected}
        renderOption={(props, option, { selected }) => {
          return (
            <li {...props}>
              <Checkbox style={{ marginRight: 8 }} checked={selected} />
              {option}
            </li>
          );
        }}
        renderInput={(params) => <TextField {...params} required={true} variant='standard' label='Branches' />}
        renderTags={(selectedOptions, getTagProps) =>
          selectedOptions.map((option, index) => {
            const { key, ...props } = getTagProps({ index });
            return <BranchChip {...props} value={option} key={key} />;
          })
        }
      />
    </BranchSelectionWrapper>
  );
};
