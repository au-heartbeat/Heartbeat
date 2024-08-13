import ReportDetailTableContainsSubtitle from '@src/components/Common/ReportDetailTableContainsSubtitle';
import { LEAD_TIME_FOR_CHANGES, LOADING, VELOCITY } from '../../fixtures';
import { render, screen } from '@testing-library/react';

describe('Report detail table contains subtitle', () => {
  it('should show loading when data is empty', () => {
    render(
      <ReportDetailTableContainsSubtitle
        title={VELOCITY}
        units={[]}
        fieldName='fieldName'
        listName='listName'
        data={null}
      />,
    );

    expect(screen.getByTestId(LOADING)).toBeInTheDocument();
    expect(screen.getByText(VELOCITY)).toBeInTheDocument();
  });

  it('should show table when data is not empty', () => {
    const mockData = [
      { id: 0, name: 'name1', valueList: [{ name: 'test1', values: ['1'] }] },
      { id: 1, name: 'name2', valueList: [{ name: 'test2', values: ['2'] }] },
      { id: 2, name: 'name3', valueList: [{ name: 'test3', values: ['3'] }] },
    ];

    render(
      <ReportDetailTableContainsSubtitle
        title={LEAD_TIME_FOR_CHANGES}
        units={[]}
        fieldName='fieldName'
        listName='listName'
        data={mockData}
      />,
    );

    expect(screen.getByLabelText(LEAD_TIME_FOR_CHANGES)).toBeInTheDocument();
  });

  it('should show table when data name contains emoji', () => {
    const mockData = [
      { id: 0, name: 'name1/:rocket: Deploy prod', valueList: [{ name: 'test1', values: ['1'] }] },
      { id: 1, name: 'name2/:rocket: Deploy prod', valueList: [{ name: 'test2', values: ['2'] }] },
      { id: 2, name: 'name3/:rocket: Deploy prod', valueList: [{ name: 'test3', values: ['3'] }] },
    ];

    render(
      <ReportDetailTableContainsSubtitle
        title={VELOCITY}
        units={[]}
        fieldName='fieldName'
        listName='listName'
        data={mockData}
      />,
    );

    expect(screen.getByLabelText(VELOCITY)).toBeInTheDocument();
  });

  it('should show default value when valueList is empty', () => {
    const mockData = [{ id: 0, name: 'name1', valueList: [] }];

    render(
      <ReportDetailTableContainsSubtitle
        title={VELOCITY}
        units={[]}
        fieldName='fieldName'
        listName='listName'
        data={mockData}
      />,
    );

    expect(screen.getAllByText('--')).toHaveLength(3);
  });
});
