import { metricsSchema } from '@src/containers/MetricsStep/form/validator';
import MetricsStep from '@src/containers/MetricsStep/MetricsStep';
import { Formik } from 'formik';

interface IMetricsProps {
  setNextDisabled: (isFormValid: boolean) => void;
}

const MetricsStepWithFormik = ({ setNextDisabled }: IMetricsProps) => {
  return (
    <>
      <Formik
        initialValues={{
          board: {
            crews: [] as string[],
          },
          pipeline: {
            crews: [] as string[],
          },
        }}
        onSubmit={async (values, helpers) => {
          console.log('helpers', helpers);
          console.log('values', values);
        }}
        validationSchema={metricsSchema}
      >
        {(formikProps) => <MetricsStep {...formikProps} setNextDisabled={setNextDisabled} />}
      </Formik>
    </>
  );
};

export default MetricsStepWithFormik;
