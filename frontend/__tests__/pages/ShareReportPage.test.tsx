import ShareReportPage from '@src/pages/ShareReportPage';
import { setupStore } from '../utils/setupStoreUtil';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PROJECT_NAME } from '../fixtures';
import { Provider } from 'react-redux';

const setup = () => {
  store = setupStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ShareReportPage />
      </MemoryRouter>
    </Provider>,
  );
};
let store = null;

describe('ShareReportPage', () => {
  it('should render share report page', () => {
    const { getByText } = setup();

    expect(getByText(PROJECT_NAME)).toBeInTheDocument();
  });
});
