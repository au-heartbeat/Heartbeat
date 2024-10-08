import { ITargetFieldType } from '@src/components/Common/MultiAutoComplete/styles';
import { act, render, waitFor, within, screen } from '@testing-library/react';
import { Classification } from '@src/containers/MetricsStep/Classification';
import { saveTargetFields } from '@src/context/Metrics/metricsSlice';
import { ERROR_MESSAGE_TIME_DURATION } from '../../fixtures';
import { saveVersion } from '@src/context/meta/metaSlice';
import { setupStore } from '../../utils/setupStoreUtil';
import userEvent from '@testing-library/user-event';
import { Provider, useSelector } from 'react-redux';

type State<T> = Record<string, Record<string, T>>;

const mockTitle = 'Classification Setting';
const mockClassificationLabel = 'Distinguished by';
const mockClassificationChartLabel = 'Visible in charts (optional)';
const mockTargetFields = [
  { flag: true, key: 'issue', name: 'Issue' },
  { flag: false, key: 'type', name: 'Type' },
  { flag: true, key: 'custom_field10060', name: 'Story testing' },
  { flag: false, key: 'custom_field10061', name: 'Story testing' },
];
const classificationChartOptionLabelPrefix = 'Classification Visible Charts Option';

jest.mock('@src/context/config/configSlice', () => ({
  ...jest.requireActual('@src/context/config/configSlice'),
  selectIsProjectCreated: jest.fn().mockReturnValue(false),
}));

jest.mock('@src/context/Metrics/metricsSlice', () => ({
  ...jest.requireActual('@src/context/Metrics/metricsSlice'),
  selectClassificationWarningMessage: jest.fn().mockReturnValue('Test warning Message'),
}));

const RenderComponent = () => {
  const targetFields = useSelector((state: State<ITargetFieldType[]>) => state.metrics.targetFields);
  return <Classification title={mockTitle} label={mockClassificationLabel} targetFields={targetFields} />;
};

const setup = async (initField: ITargetFieldType[], version: string = '1.2.1') => {
  const store = setupStore();
  store.dispatch(saveTargetFields(initField));
  store.dispatch(saveVersion(version));
  return render(
    <Provider store={store}>
      <RenderComponent />
    </Provider>,
  );
};

describe('Classification', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show Classification when render Classification component', async () => {
    await setup(mockTargetFields);

    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText(mockClassificationLabel)).toBeInTheDocument();
    expect(screen.getByText(mockClassificationChartLabel)).toBeInTheDocument();
  });

  describe('Classification Visible in charts (optional)', () => {
    it('should disable classification charts when classification is not selected', async () => {
      await setup([
        { flag: false, key: 'issue', name: 'Issue' },
        { flag: false, key: 'type', name: 'Type' },
        { flag: false, key: 'custom_field10060', name: 'Story testing' },
        { flag: false, key: 'custom_field10061', name: 'Story testing' },
      ]);

      expect(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      ).toBeDisabled();
      expect(screen.getByLabelText('new label')).toBeInTheDocument();
    });

    it('should enable classification charts when classification is selected', async () => {
      await setup(mockTargetFields);

      expect(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      ).not.toBeDisabled();
      expect(screen.getByLabelText('new label')).toBeInTheDocument();
    });

    it('should show selected classification options when classification is selected', async () => {
      await setup(mockTargetFields);
      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );

      await waitFor(() => {
        const listBox = within(screen.getByRole('listbox'));
        expect(screen.queryAllByRole('option')).toHaveLength(3);
        expect(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} Issue`)).toBeInTheDocument();
        expect(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} Story testing-1`)).toBeInTheDocument();
      });
    });

    it('should show selected classification options when select a new classification', async () => {
      await setup(mockTargetFields);
      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );

      expect(screen.queryAllByRole('option')).toHaveLength(3);

      await userEvent.click(screen.getByRole('combobox', { name: mockClassificationLabel }));
      await userEvent.click(screen.getByRole('option', { name: /Type/i }));
      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );

      await waitFor(() => {
        expect(screen.queryAllByRole('option')).toHaveLength(4);
      });
    });

    it('should remove selected classification charts when remove a classification', async () => {
      await setup(mockTargetFields);
      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );
      const listBox = within(screen.getByRole('listbox'));
      const chartFormItem = within(screen.getByLabelText('Classification Visible Charts'));
      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} Issue`));

      await waitFor(() => {
        expect(chartFormItem.getByRole('button', { name: 'Issue' })).toBeVisible();
      });

      const classificationFormItem = within(screen.getByLabelText('Classification Setting AutoComplete'));
      await userEvent.click(
        within(classificationFormItem.getByRole('button', { name: 'Issue' })).getByTestId('CancelIcon'),
      );

      await waitFor(() => {
        expect(chartFormItem.queryByRole('button', { name: 'Issue' })).toBeNull();
      });
    });

    it('should select classification charts correctly', async () => {
      await setup(mockTargetFields);
      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );
      const listBox = within(screen.getByRole('listbox'));
      const chartFormItem = within(screen.getByLabelText('Classification Visible Charts'));
      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} Issue`));

      await waitFor(() => {
        expect(chartFormItem.getByRole('button', { name: 'Issue' })).toBeVisible();
      });

      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} Issue`));

      await waitFor(() => {
        expect(chartFormItem.queryByRole('button', { name: 'Issue' })).toBeNull();
      });
    });

    it('should select all classification charts correctly', async () => {
      await setup(mockTargetFields);
      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );
      const listBox = within(screen.getByRole('listbox'));
      const chartFormItem = within(screen.getByLabelText('Classification Visible Charts'));
      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} All`));

      await waitFor(() => {
        expect(chartFormItem.getByRole('button', { name: 'Issue' })).toBeVisible();
        expect(chartFormItem.getByRole('button', { name: 'Story testing-1' })).toBeVisible();
      });

      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} All`));

      await waitFor(() => {
        expect(chartFormItem.queryByRole('button', { name: 'Issue' })).toBeNull();
        expect(chartFormItem.queryByRole('button', { name: 'Story testing-1' })).toBeNull();
      });
    });

    it('should enable and display all option given selected classification is less than 4', async () => {
      await setup(mockTargetFields);

      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );
      const listBox = within(screen.getByRole('listbox'));

      await waitFor(() => {
        expect(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} All`)).not.toHaveAttribute(
          'aria-disabled',
          'true',
        );
      });
    });

    it('should not show all option given selected classification is more than 4', async () => {
      await setup([
        { flag: true, key: 'issue', name: 'Issue' },
        { flag: true, key: 'type', name: 'Type' },
        { flag: true, key: 'custom_field10060', name: 'Story testing' },
        { flag: true, key: 'custom_field10061', name: 'Story testing' },
        { flag: true, key: 'more_than_four', name: 'Test' },
      ]);

      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );
      const listBox = within(screen.getByRole('listbox'));

      await waitFor(() => {
        expect(listBox.queryByLabelText(`${classificationChartOptionLabelPrefix} All`)).toBeNull();
      });
    });

    it('should disable other options given when select 4 classification charts', async () => {
      const mockStatus = [
        { flag: true, key: 'issue', name: 'Issue' },
        { flag: true, key: 'type', name: 'Type' },
        { flag: true, key: 'custom_field10060', name: 'Story testing' },
        { flag: true, key: 'custom_field10061', name: 'Story testing' },
        { flag: true, key: 'more_than_four', name: 'Test' },
      ];
      await setup(mockStatus);

      await userEvent.click(
        screen.getByRole('combobox', { name: (content) => content.includes(mockClassificationChartLabel) }),
      );
      const listBox = within(screen.getByRole('listbox'));
      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} ${mockStatus[0].name}`));
      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} ${mockStatus[1].name}`));
      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} ${mockStatus[2].name}-1`));
      await userEvent.click(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} ${mockStatus[3].name}-2`));

      await waitFor(() => {
        expect(listBox.getByLabelText(`${classificationChartOptionLabelPrefix} ${mockStatus[4].name}`)).toHaveAttribute(
          'aria-disabled',
          'true',
        );
      });
    });

    it('should not show new label when version is more than 1.3.0', async () => {
      await setup(
        [
          { flag: false, key: 'issue', name: 'Issue' },
          { flag: false, key: 'type', name: 'Type' },
          { flag: false, key: 'custom_field10060', name: 'Story testing' },
          { flag: false, key: 'custom_field10061', name: 'Story testing' },
        ],
        '1.3.1',
      );

      expect(screen.queryByLabelText('new label')).not.toBeInTheDocument();
    });

    it('should show new label when version is equal to 1.3.0', async () => {
      await setup(
        [
          { flag: false, key: 'issue', name: 'Issue' },
          { flag: false, key: 'type', name: 'Type' },
          { flag: false, key: 'custom_field10060', name: 'Story testing' },
          { flag: false, key: 'custom_field10061', name: 'Story testing' },
        ],
        '1.3.0',
      );

      expect(screen.queryByLabelText('new label')).toBeInTheDocument();
    });
  });

  describe('Classification Distinguished by', () => {
    it('should show default options when initialization', async () => {
      await setup(mockTargetFields);

      expect(screen.getByText('Issue')).toBeInTheDocument();
      expect(screen.queryByText('Type')).not.toBeInTheDocument();
    });

    it('should show all options when click selectBox', async () => {
      await setup(mockTargetFields);
      await userEvent.click(screen.getByRole('combobox', { name: mockClassificationLabel }));

      expect(screen.getByRole('option', { name: 'Issue' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Type' })).toBeInTheDocument();
    });

    it('should show all targetField when click All option', async () => {
      await setup(mockTargetFields);
      const names = mockTargetFields.map((item) => item.name);
      await userEvent.click(screen.getByRole('combobox', { name: mockClassificationLabel }));

      await userEvent.click(screen.getByRole('option', { name: /all/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: names[0] })).toBeVisible();
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: names[1] })).toBeVisible();
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: `${names[2]}-1` })).toBeVisible();
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: `${names[3]}-2` })).toBeVisible();
      });
    });

    it('should hide all options when de-select option given options selected', async () => {
      await setup(mockTargetFields);
      const names = mockTargetFields.map((item) => item.name);
      await userEvent.click(screen.getByRole('combobox', { name: mockClassificationLabel }));
      await userEvent.click(screen.getByRole('option', { name: 'Issue' }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: names[0] })).not.toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('option', { name: 'Story testing-1' }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: names[2] })).not.toBeInTheDocument();
      });
    });

    it('should show toggle show all options when toggle select all option', async () => {
      await setup(mockTargetFields.map((item) => ({ ...item, flag: true })));
      const names = mockTargetFields.map((item) => item.name);

      await userEvent.click(screen.getByRole('combobox', { name: mockClassificationLabel }));
      await userEvent.click(screen.getByRole('option', { name: /all/i }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: names[0] })).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: names[1] })).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: `${names[2]}-1` })).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: `${names[3]}-2` })).not.toBeInTheDocument();
      });
    });

    it('should show selected targetField when click selected field', async () => {
      await setup(mockTargetFields);
      const names = mockTargetFields.map((item) => item.name);

      await userEvent.click(screen.getByRole('combobox', { name: mockClassificationLabel }));
      await userEvent.click(screen.getByText('All'));

      const listBox = within(screen.getByRole('listbox'));

      await userEvent.click(listBox.getByRole('option', { name: names[0] }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: names[0] })).not.toBeInTheDocument();
      });
    });

    it('should show warning message when classification warning message has a value in cycleTime component', async () => {
      await setup(mockTargetFields);

      expect(screen.getByText('Test warning Message')).toBeVisible();
    });

    it('should add suffix when targetFields have duplicated names', async () => {
      await setup(mockTargetFields);
      await userEvent.click(screen.getByRole('combobox', { name: mockClassificationLabel }));

      expect(screen.getByRole('option', { name: 'Story testing-1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Story testing-2' })).toBeInTheDocument();
    });

    it('should show disable warning message when classification warning message has a value after two seconds in cycleTime component', async () => {
      jest.useFakeTimers();
      await setup(mockTargetFields);

      act(() => {
        jest.advanceTimersByTime(ERROR_MESSAGE_TIME_DURATION);
      });

      await waitFor(() => {
        expect(screen.queryByText('Test warning Message')).not.toBeInTheDocument();
      });
    });
  });
});
