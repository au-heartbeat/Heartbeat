import NewFunctionsLabel from '@src/components/Common/NewFunctionsLabel';
import { saveVersion } from '@src/context/meta/metaSlice';
import { setupStore } from '@test/utils/setupStoreUtil';
import { render, screen } from '@testing-library/react';
import { NewLabelType } from '@src/constants/commons';
import { Provider } from 'react-redux';

const store = setupStore();

describe('NewFunctionsLabel', () => {
  const setup = (version: string, initVersion: string, newLabelType: NewLabelType = NewLabelType.General) => {
    store.dispatch(saveVersion(version));
    return render(
      <Provider store={store}>
        <NewFunctionsLabel initVersion={initVersion} newLabelType={newLabelType}>
          test
        </NewFunctionsLabel>
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

  it('should not show new label when init version exist alpha', () => {
    setup('1.3.0', '1.3.0-alpha');

    expect(screen.queryByLabelText('new label')).not.toBeInTheDocument();
  });

  it('should not show new label when init version exist pre-release', () => {
    setup('1.3.0', '1.3.0-0.3.1');

    expect(screen.queryByLabelText('new label')).not.toBeInTheDocument();
  });

  it('should show customize new label when version from store is equal to version that functions create and type is CustomizeMarginAndHeight', () => {
    setup('1.3.0', '1.3.0', NewLabelType.CustomizeMarginAndHeight);

    expect(screen.queryByLabelText('new label')).toBeInTheDocument();
  });
});
