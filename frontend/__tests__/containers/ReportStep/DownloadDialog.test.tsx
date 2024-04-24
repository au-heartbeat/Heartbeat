import {render, screen} from '@testing-library/react';
import {DateRangeItem, DownloadDialog} from "@src/containers/ReportStep/DownloadDialog";

describe('DownloadDialog', () => {
  const handleCloseFn = jest.fn();
  const downloadCSVFileFn = jest.fn()
  const mockData = [
    {
      startDate: "2024-01-01",
      endDate: "2024-01-14",
      disabled: false,
    },
    {
      startDate: "2024-01-15",
      endDate: "2024-01-31",
      disabled: false,
    }
  ]

  const setup = (dateRangeList: DateRangeItem[]) => {
    render(
        <DownloadDialog
          isShowDialog={true}
          handleClose={handleCloseFn}
          dateRangeList={dateRangeList}
          downloadCSVFile={downloadCSVFileFn}
        />
    );
  };

  it('should show all dateRanges in DownloadDialog', () => {
    setup(mockData);

    expect(screen.getByText("2024/01/01 - 2024/01/14")).toBeInTheDocument();
    expect(screen.getByText("2024/01/15 - 2024/01/31")).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')[0]).not.toBeDisabled();
    expect(screen.getAllByRole('checkbox')[1]).not.toBeDisabled();
  });

  it('should not be clickable when there is an error fetching data for this dataRange', () => {
    const mockDataWithDisabledDateRange = [...mockData,
      {
      startDate: "2024-02-01",
      endDate: "2024-02-14",
      disabled: true,
    }
    ]

    setup(mockDataWithDisabledDateRange);
    const checkbox = screen.getAllByRole('checkbox')[2];

    expect(checkbox).toBeDisabled();
  });
});
