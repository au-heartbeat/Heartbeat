import NewFunctionsLabel from '@src/components/Common/NewFunctionsLabel';
import { saveVersion } from '@src/context/meta/metaSlice';
import { setupStore } from '@test/utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

const store = setupStore();

describe('NewFunctionsLabel', () => {
  const setup = (version: string, createVersion: string) => {
    store.dispatch(saveVersion(version));
    return render(
      <Provider store={store}>
        <NewFunctionsLabel createVersion={createVersion}>test</NewFunctionsLabel>
      </Provider>,
    );
  };

  it('should show new label when version from store is less than version that functions create', () => {
    setup('1.2.1', '1.3.0');

    expect(screen.queryByLabelText('new label')).toBeInTheDocument();
  });

  it('should show new label when version from store is equal to version that functions create', () => {
    setup('1.3.0', '1.3.0');

    expect(screen.queryByLabelText('new label')).toBeInTheDocument();
  });

  it('should not show new label when version from store is more than version that functions create', () => {
    setup('1.3.1', '1.3.0');

    expect(screen.queryByLabelText('new label')).not.toBeInTheDocument();
  });

  it('should show new label when version from store is more than version that functions create and there are more decimal places', () => {
    setup('1.3.0', '1.3.0.1');

    expect(screen.queryByLabelText('new label')).toBeInTheDocument();
  });
});
