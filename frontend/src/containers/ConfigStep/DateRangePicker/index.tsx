import { DateRangePickerGroup } from '@src/containers/ConfigStep/DateRangePicker/DateRangePickerGroup';
import { SortDateRange } from '@src/containers/ConfigStep/DateRangePicker/SortDateRange';
import SectionTitleWithTooltip from '@src/components/Common/SectionTitleWithTooltip';
import { TitleContainer } from '@src/containers/ConfigStep/DateRangePicker/style';
import { TIME_RANGE_TITLE, TIPS } from '@src/constants/resources';

export const DateRangePickerSection = () => {
  return (
    <div aria-label='Time range section'>
      <TitleContainer>
        <SectionTitleWithTooltip
          title={TIME_RANGE_TITLE}
          tooltipText={TIPS.TIME_RANGE_PICKER}
          titleStyle={{
            margin: '1rem 0',
          }}
        />
        <SortDateRange />
      </TitleContainer>
      <DateRangePickerGroup />
    </div>
  );
};
