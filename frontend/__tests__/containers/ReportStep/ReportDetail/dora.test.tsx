import { DoraDetail } from '@src/containers/ReportStep/ReportDetail';
import { ReportResponseDTO } from '@src/clients/report/dto/response';
import { render, screen, within } from '@testing-library/react';
import { reportMapper } from '@src/hooks/reportMapper/report';
import React from 'react';

jest.mock('@src/hooks/reportMapper/report');
describe('DoraDetail', () => {
  const data: ReportResponseDTO = {} as ReportResponseDTO;

  afterEach(jest.clearAllMocks);

  it('should render a back link', () => {
    (reportMapper as jest.Mock).mockReturnValue({});

    render(<DoraDetail data={data} isExistSourceControl={false} onBack={jest.fn()} isShowBack />);

    expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  describe('Deployment Frequency', () => {
    it('should show deploymentFrequencyList when deploymentFrequencyList data is existing', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        deploymentFrequencyList: [{ id: 0, name: 'name1', valueList: [{ value: 1 }] }],
      });
      render(<DoraDetail isExistSourceControl={false} data={data} onBack={jest.fn()} isShowBack />);
      const deploymentFrequencyTable = screen.getByLabelText('Deployment Frequency');
      expect(screen.getByText('Deployment Frequency')).toBeInTheDocument();
      expect(deploymentFrequencyTable).toBeInTheDocument();
      expect(within(deploymentFrequencyTable).getAllByLabelText('tr').length).toBe(1);
    });

    it('should not show deploymentFrequencyList when deploymentFrequencyList data is not existing', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        deploymentFrequencyList: null,
      });
      render(<DoraDetail isExistSourceControl={false} data={data} onBack={jest.fn()} isShowBack />);
      expect(screen.queryAllByText('Deployment Frequency').length).toEqual(0);
    });
  });

  describe('Lead Time For Changes', () => {
    it('should show leadTimeForChangesList when leadTimeForChangesList data is existing', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        leadTimeForChangesList: [{ id: 0, name: 'name1', valuesList: [{ name: 'test1', values: [1] }] }],
      });
      render(<DoraDetail isExistSourceControl={false} data={data} onBack={jest.fn()} isShowBack />);
      const leadTimeForChangesTable = screen.getByLabelText('Lead Time For Changes');
      expect(screen.getByText('Lead Time For Changes')).toBeInTheDocument();
      expect(leadTimeForChangesTable).toBeInTheDocument();
      expect(within(leadTimeForChangesTable).queryAllByLabelText('tr').length).toBe(2);
    });

    it('should not show leadTimeForChangesList when leadTimeForChangesList data is not existing', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        leadTimeForChangesList: null,
      });
      render(<DoraDetail isExistSourceControl={false} data={data} onBack={jest.fn()} isShowBack />);
      expect(screen.queryAllByText('Lead Time For Changes').length).toEqual(0);
    });

    it('should show leadTimeForChangesList and color is gray when leadTimeForChangesList data is existing and exists source control', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        leadTimeForChangesList: [{ id: 0, name: 'name1', valueList: [{ name: 'Pipeline Lead Time', values: [1] }] }],
      });
      render(<DoraDetail isExistSourceControl={true} data={data} onBack={jest.fn()} isShowBack />);

      const leadTimeForChangesTable = screen.getByLabelText('Lead Time For Changes');

      expect(screen.getByText('Lead Time For Changes')).toBeInTheDocument();
      expect(leadTimeForChangesTable).toBeInTheDocument();

      const rows = within(leadTimeForChangesTable).queryAllByLabelText('tr');

      expect(rows.length).toBe(2);

      const tds = within(rows[1]).getAllByLabelText('td');

      expect(tds.length).toBe(2);

      tds.forEach((td) => {
        expect(td.getAttribute('style')).toEqual('color: gray;');
      });
    });
  });

  describe('Pipeline Change Failure Rate', () => {
    it('should show pipelineChangeFailureRateList when devChangeFailureRateList data is existing', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        pipelineChangeFailureRateList: [{ id: 0, name: 'name1', valueList: [{ value: 1 }] }],
      });
      render(<DoraDetail isExistSourceControl={false} data={data} onBack={jest.fn()} isShowBack />);
      const pipelineChangeFailureRateTable = screen.getByTestId('Pipeline Change Failure Rate');
      expect(screen.getByText('Pipeline Change Failure Rate')).toBeInTheDocument();
      expect(pipelineChangeFailureRateTable).toBeInTheDocument();
      expect(within(pipelineChangeFailureRateTable).queryAllByTestId('tr').length).toBe(1);
    });

    it('should not show devChangeFailureRateList when devChangeFailureRateList data is not existing', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        devChangeFailureRateList: null,
      });
      render(<DoraDetail isExistSourceControl={false} data={data} onBack={jest.fn()} isShowBack />);
      expect(screen.queryAllByText('Dev Change Failure Rate').length).toEqual(0);
    });
  });

  describe('Pipeline Mean Time To Recovery', () => {
    it('should show pipelineMeanTimeToRecoveryList when devMeanTimeToRecoveryList data is existing', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        pipelineMeanTimeToRecoveryList: [{ id: 0, name: 'name1', valueList: [{ value: 1 }] }],
      });
      render(<DoraDetail isExistSourceControl={false} data={data} onBack={jest.fn()} isShowBack />);
      const pipelineMeanTimeToRecoveryTable = screen.getByTestId('Pipeline Mean Time To Recovery');
      expect(screen.getByText('Pipeline Mean Time To Recovery')).toBeInTheDocument();
      expect(pipelineMeanTimeToRecoveryTable).toBeInTheDocument();
      expect(within(pipelineMeanTimeToRecoveryTable).queryAllByTestId('tr').length).toBe(1);
    });

    it('should not show devMeanTimeToRecoveryList when devMeanTimeToRecoveryList data is not existing', () => {
      (reportMapper as jest.Mock).mockReturnValue({
        devMeanTimeToRecoveryList: null,
      });
      render(<DoraDetail isExistSourceControl={false} data={data} onBack={jest.fn()} isShowBack />);
      expect(screen.queryAllByText('Dev Mean Time To Recovery').length).toEqual(0);
    });
  });
});
