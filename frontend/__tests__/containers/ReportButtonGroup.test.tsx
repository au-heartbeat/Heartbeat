import { EXPORT_METRIC_DATA, MOCK_REPORT_RESPONSE } from '../fixtures';
import { ReportButtonGroup } from '@src/containers/ReportButtonGroup';
import { setupStore } from '@test/utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

describe('test', () => {
  const mockHandler = jest.fn();
  const mockData = [];

  const setup = () => {
    const store = setupStore();
    render(
      <Provider store={store}>
        <ReportButtonGroup
          isShowSave={true}
          isShowExportMetrics={true}
          isShowExportBoardButton={true}
          isShowExportPipelineButton={true}
          handleBack={mockHandler}
          handleSave={mockHandler}
          csvTimeStamp={1239013}
          dateRangeRequestResults={mockData}
        />
      </Provider>,
    );
  };

  it('test', () => {
    setup();

    expect(screen.queryByRole('button', { name: EXPORT_METRIC_DATA })).toBeDisabled();
  });
});
