import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import { IMetricsInitialValues } from '@src/containers/MetricsStep/form/types';
import MultiAutoComplete from '@src/components/Common/MultiAutoComplete';
import { selectMetricsContent } from '@src/context/Metrics/metricsSlice';
import { useFormikContext, Field } from 'formik';
import { useAppSelector } from '@src/hooks';
import React, { useEffect } from 'react';

interface crewsProps {
  options: string[];
  title: string;
  label: string;
  name: string;
}

export const PipelineCrews = ({ options, title, label, name }: crewsProps) => {
  const { pipelineCrews } = useAppSelector(selectMetricsContent);

  const formikProps = useFormikContext<IMetricsInitialValues>();
  console.log('[<PipelineCrews />] formikProps', formikProps);
  const selectedUsers = formikProps.values.pipeline.crews;
  console.log('[<PipelineCrews />] selectedUsers', selectedUsers);
  const isAllSelected = options.length > 0 && formikProps.values.pipeline.crews.length === options.length;

  const fieldSetter = formikProps.setFieldValue;
  const handleCrewChange = (_: React.SyntheticEvent, value: string[]) => {
    if (value[value.length - 1] === 'All') {
      fieldSetter(name, value.length === options.length + 1 ? [] : [...options]);
      return;
    }
    fieldSetter(name, [...value]);
  };

  useEffect(() => {
    fieldSetter(name, pipelineCrews);
  }, [fieldSetter, pipelineCrews, name]);

  return (
    <>
      <MetricsSettingTitle title={title} />
      <Field
        name={name}
        component={MultiAutoComplete}
        ariaLabel='Pipeline Included Crews multiple select'
        optionList={options}
        isError={false}
        isSelectAll={isAllSelected}
        onChangeHandler={handleCrewChange}
        selectedOption={selectedUsers}
        textFieldLabel={label}
        isBoardCrews={false}
      />
    </>
  );
};
