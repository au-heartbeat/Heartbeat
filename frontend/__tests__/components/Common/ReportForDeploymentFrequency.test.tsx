import ReportForDeploymentFrequency from '@src/components/Common/ReportForDeploymentFrequency';
import { CYCLE_TIME, DEPLOYMENT_FREQUENCY, VELOCITY } from '../../fixtures';
import { ReportSuffixUnits } from '@src/constants/resources';
import { render, screen } from '@testing-library/react';

describe('Report for two columns', () => {
  it('should show table when data is not empty', () => {
    const mockData = [
      { id: 0, name: 'name1', valueList: [{ value: '1' }] },
      { id: 1, name: 'name2', valueList: [{ value: '2' }] },
      { id: 2, name: 'name3', valueList: [{ value: '3' }] },
    ];

    render(<ReportForDeploymentFrequency title={VELOCITY} tableTitles={[VELOCITY]} data={mockData} />);

    expect(screen.getByLabelText(VELOCITY)).toBeInTheDocument();
  });

  it('should show cycle time table row', () => {
    const mockData = [
      { id: 0, name: 'name1', valueList: [{ value: '1.1', units: ReportSuffixUnits.DaysPerCard }] },
      { id: 1, name: 'name2', valueList: [{ value: '2', units: ReportSuffixUnits.DaysPerCard }] },
      { id: 2, name: <div>name3</div>, valueList: [{ value: '3', units: ReportSuffixUnits.DaysPerCard }] },
    ];

    render(<ReportForDeploymentFrequency title={CYCLE_TIME} tableTitles={[CYCLE_TIME]} data={mockData} />);

    expect(screen.getByLabelText(CYCLE_TIME)).toBeInTheDocument();
  });

  it('should show table when data name contains emoji', () => {
    const mockData = [
      { id: 0, name: 'name1/:rocket: Deploy prod', valueList: [{ value: '1' }] },
      { id: 1, name: 'name2/:rocket: Deploy prod', valueList: [{ value: '2' }] },
      { id: 2, name: 'name3/:rocket: Deploy prod', valueList: [{ value: '3' }] },
    ];

    render(
      <ReportForDeploymentFrequency
        title={DEPLOYMENT_FREQUENCY}
        tableTitles={[DEPLOYMENT_FREQUENCY]}
        data={mockData}
      />,
    );

    expect(screen.getByLabelText(DEPLOYMENT_FREQUENCY)).toBeInTheDocument();
  });

  it('should show table when data with Units is not empty', () => {
    const mockData = [
      { id: 0, name: 'name1', valueList: [{ value: 1, units: ReportSuffixUnits.DaysPerCard }] },
      { id: 1, name: 'name2', valueList: [{ value: 2, units: ReportSuffixUnits.DaysPerCard }] },
    ];

    render(<ReportForDeploymentFrequency title={CYCLE_TIME} tableTitles={[CYCLE_TIME]} data={mockData} />);

    expect(screen.getByLabelText(CYCLE_TIME)).toBeInTheDocument();
  });
});
