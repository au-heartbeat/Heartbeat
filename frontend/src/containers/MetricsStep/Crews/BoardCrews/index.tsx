import { AssigneeFilter } from '@src/containers/MetricsStep/Crews/AssigneeFilter';
import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import { IMetricsInitialValues } from '@src/containers/MetricsStep/form/types';
import MultiAutoComplete from '@src/components/Common/MultiAutoComplete';
import { WarningMessage } from '@src/containers/MetricsStep/Crews/style';
import { selectMetricsContent } from '@src/context/Metrics/metricsSlice';
import { useFormikContext, Field } from 'formik';
import { FormHelperText } from '@mui/material';
import { useAppSelector } from '@src/hooks';
import React, { useEffect } from 'react';

interface crewsProps {
  options: string[];
  title: string;
  label: string;
  name: string;
}

export const BoardCrews = ({ options, title, label, name }: crewsProps) => {
  const { users } = useAppSelector(selectMetricsContent);

  const formikProps = useFormikContext<IMetricsInitialValues>();
  console.log('[<BoardCrews /> formikProps', formikProps);
  const selectedUsers = formikProps.values.board.crews;
  console.log('[<BoardCrews /> selectedUsers', selectedUsers);
  const isEmptyCrewData = selectedUsers.length === 0;
  const isAllSelected = options.length > 0 && formikProps.values.board.crews.length === options.length;

  const handleCrewChange = (_: React.SyntheticEvent, value: string[]) => {
    if (value[value.length - 1] === 'All') {
      formikProps.setFieldValue(name, value.length === options.length + 1 ? [] : [...options]);
      return;
    }
    formikProps.setFieldValue(name, [...value]);
  };

  useEffect(() => {
    formikProps.setFieldValue(name, users);
  }, [users, formikProps, name]);

  return (
    <>
      <MetricsSettingTitle title={title} />
      <Field
        name={name}
        component={MultiAutoComplete}
        ariaLabel='Board Included Crews multiple select'
        optionList={options}
        isError={isEmptyCrewData}
        isSelectAll={isAllSelected}
        onChangeHandler={handleCrewChange}
        selectedOption={selectedUsers}
        textFieldLabel={label}
        isBoardCrews={true}
      />
      {<AssigneeFilter />}
      <FormHelperText>
        {isEmptyCrewData && (
          <WarningMessage>
            {label} is <strong>required</strong>
          </WarningMessage>
        )}
      </FormHelperText>
    </>
  );
};
