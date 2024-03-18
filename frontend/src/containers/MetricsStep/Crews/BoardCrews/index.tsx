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
import { Button } from '@mui/material';

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
  const errors = formikProps.errors?.board?.crews;
  console.log('[<BoardCrews /> selectedUsers', selectedUsers);
  console.log('[<BoardCrews /> errors', errors);
  const isAllSelected = options.length > 0 && formikProps.values.board.crews.length === options.length;

  const fieldSetter = formikProps.setFieldValue;
  const handleCrewChange = (_: React.SyntheticEvent, value: string[]) => {
    if (value[value.length - 1] === 'All') {
      fieldSetter(name, value.length === options.length + 1 ? [] : [...options]);
      return;
    }
    fieldSetter(name, [...value]);
  };

  useEffect(() => {
    fieldSetter(name, users);
  }, [fieldSetter, users, name]);

  const validateForm = async () => {
    console.log('validateForm');
    await formikProps.validateForm();
  };

  return (
    <>
      <MetricsSettingTitle title={title} />
      <Button onClick={validateForm}>Temporary formik submit button</Button>
      <Field
        name={name}
        component={MultiAutoComplete}
        ariaLabel='Board Included Crews multiple select'
        optionList={options}
        isError={!!errors}
        isSelectAll={isAllSelected}
        onChangeHandler={handleCrewChange}
        selectedOption={selectedUsers}
        textFieldLabel={label}
        isBoardCrews={true}
      />
      {<AssigneeFilter />}
      <FormHelperText>{!!errors && <WarningMessage>{errors}</WarningMessage>}</FormHelperText>
    </>
  );
};
