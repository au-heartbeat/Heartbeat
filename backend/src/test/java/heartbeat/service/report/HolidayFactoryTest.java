package heartbeat.service.report;

import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class HolidayFactoryTest {

	@Mock
	private VietnamHoliday vietnamHoliday;

	@Mock
	private ChinaHoliday chinaHoliday;

	@Mock
	private RegularHoliday regularHoliday;

	@InjectMocks
	private HolidayFactory holidayFactory;

	@Test
	public void shouldReturnRegularHolidayWhenSendRegular() {
		CalendarTypeEnum calendarType = CalendarTypeEnum.REGULAR;
		AbstractCountryHoliday holiday = holidayFactory.build(calendarType);
		assertTrue(holiday instanceof RegularHoliday);
	}

	@Test
	public void shouldReturnChinaHolidayWhenSendChina() {
		CalendarTypeEnum calendarType = CalendarTypeEnum.CN;
		AbstractCountryHoliday holiday = holidayFactory.build(calendarType);
		assertTrue(holiday instanceof ChinaHoliday);
	}

	@Test
	public void shouldReturnVietnamHolidayWhenSendVietnam() {
		CalendarTypeEnum calendarType = CalendarTypeEnum.VN;
		AbstractCountryHoliday holiday = holidayFactory.build(calendarType);
		assertTrue(holiday instanceof VietnamHoliday);
	}

}
