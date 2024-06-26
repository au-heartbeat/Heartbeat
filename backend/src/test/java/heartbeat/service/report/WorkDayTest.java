package heartbeat.service.report;

import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import heartbeat.service.report.model.WorkInfo;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkDayTest {

	private static final long ONE_DAY_MILLISECONDS = 1000L * 60 * 60 * 24;

	private static final long ONE_HOUR_MILLISECONDS = 1000L * 60 * 60;

	private static final long ONE_MINUTE_MILLISECONDS = 1000L * 60;


	@Mock
	private ChinaHoliday chinaHoliday;

	@Mock
	private VietnamHoliday vietnamHoliday;

	@Mock
	private RegularHoliday regularHoliday;

	@Mock
	private HolidayFactory holidayFactory;

	@InjectMocks
	WorkDay workDay;
//
//	@BeforeEach
//	public void setUp() {
//		Map<String, Boolean> holidayMap = Map.of("2023-01-01", true, "2023-01-28", false);
//		when(holidayFactory.build(CalendarTypeEnum.REGULAR)).thenReturn(regularHoliday);
//		when(holidayFactory.build(CalendarTypeEnum.CN)).thenReturn(chinaHoliday);
//		when(holidayFactory.build(CalendarTypeEnum.VN)).thenReturn(vietnamHoliday);
//		when(chinaHoliday.loadHolidayList(any())).thenReturn(holidayMap);
//		when(regularHoliday.loadHolidayList(any())).thenReturn(new HashMap<>());
//		when(vietnamHoliday.loadHolidayList(any())).thenReturn(holidayMap);
//	}

	@Test
	void shouldReturnDayIsHoliday() {

		CalendarTypeEnum calendarType = CalendarTypeEnum.CN;
		Map<String, Boolean> holidayMap = Map.of("2023-01-01", true, "2023-01-28", false);
		when(holidayFactory.build(CalendarTypeEnum.REGULAR)).thenReturn(regularHoliday);
		when(holidayFactory.build(CalendarTypeEnum.CN)).thenReturn(chinaHoliday);
		when(holidayFactory.build(CalendarTypeEnum.VN)).thenReturn(vietnamHoliday);
		when(chinaHoliday.loadHolidayList(any())).thenReturn(holidayMap);
		when(regularHoliday.loadHolidayList(any())).thenReturn(new HashMap<>());
		when(vietnamHoliday.loadHolidayList(any())).thenReturn(holidayMap);

		LocalDate holidayTime = LocalDate.of(2023, 1, 1);
		LocalDate workdayTime = LocalDate.of(2023, 1, 28);
//
//		when(holidayFactory.build(calendarType)).thenReturn(chinaHoliday);
//		when(chinaHoliday.loadHolidayList("2024")).thenReturn(holidayMap);

//		workDay.selectCalendarType(calendarType);
		boolean resultWorkDay = workDay.verifyIfThisDayHoliday(holidayTime, calendarType);
		boolean resultHoliday = workDay.verifyIfThisDayHoliday(workdayTime, calendarType);

		assertTrue(resultWorkDay);
		Assertions.assertFalse(resultHoliday);
	}

	@Test
	void shouldReturnDayIsHolidayWithoutChineseHoliday() {
		CalendarTypeEnum calendarType = CalendarTypeEnum.REGULAR;
		LocalDate holidayTime = LocalDate.of(2023, 1, 1);
		LocalDate workdayTime = LocalDate.of(2023, 1, 28);
		Map<String, Boolean> holidayMap = Map.of();
		when(holidayFactory.build(calendarType)).thenReturn(regularHoliday);
		when(regularHoliday.loadHolidayList("2024")).thenReturn(holidayMap);

		workDay.selectCalendarType(CalendarTypeEnum.REGULAR);
		boolean resultWorkDay = workDay.verifyIfThisDayHoliday(holidayTime, calendarType);
		boolean resultHoliday = workDay.verifyIfThisDayHoliday(workdayTime, calendarType);

		assertTrue(resultWorkDay);
		assertTrue(resultHoliday);
	}

	@Test
	void shouldReturnRightWorkDaysWhenCalculateWorkDaysBetween() {
		when(holidayFactory.build(CalendarTypeEnum.REGULAR)).thenReturn(regularHoliday);
		workDay.selectCalendarType(CalendarTypeEnum.REGULAR);

		long result = workDay.calculateWorkDaysBetween(WorkDayFixture.START_TIME(), WorkDayFixture.END_TIME(), CalendarTypeEnum.REGULAR,
			ZoneId.of("Asia/Shanghai"));
		long resultNewYear = workDay.calculateWorkDaysBetween(WorkDayFixture.START_TIME_NEW_YEAR(),
				WorkDayFixture.END_TIME_NEW_YEAR(), CalendarTypeEnum.REGULAR, ZoneId.of("Asia/Shanghai"));

		Assertions.assertEquals(23, result);
		Assertions.assertEquals(22, resultNewYear);
	}

	@Nested
	class CalculateWorkDaysToTwoScale {

		@BeforeEach
		void setup() {
			when(holidayFactory.build(CalendarTypeEnum.REGULAR)).thenReturn(regularHoliday);
			workDay.selectCalendarType(CalendarTypeEnum.REGULAR);
		}

		@Test
		void shouldReturnRightWorkDaysWhenCalculateWorkDaysToTwoScaleAndStartIsWorkDayAndEndIsWorkDay() {
			long startTime = LocalDateTime.of(2024, 3, 1, 1, 1, 1).toInstant(ZoneOffset.ofHours(8)).toEpochMilli();
			long endTime = LocalDateTime.of(2024, 3, 4, 2, 2, 2).toInstant(ZoneOffset.ofHours(8)).toEpochMilli();

			double expectDays = (double) (ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS + 1000)
					/ ONE_DAY_MILLISECONDS;
			expectDays = BigDecimal.valueOf(expectDays).setScale(2, RoundingMode.HALF_UP).doubleValue();

			double days = workDay.calculateWorkDaysToTwoScale(startTime, endTime, CalendarTypeEnum.REGULAR, ZoneId.of("Asia/Shanghai"));

			Assertions.assertEquals(expectDays, days);
		}

		@Test
		void shouldReturnRightWorkDaysWhenCalculateWorkDaysToTwoScaleAndStartIsWorkDayAndEndIsNonWorkDay() {
			long startTime = LocalDateTime.of(2024, 3, 1, 1, 1, 1).toInstant(ZoneOffset.ofHours(8)).toEpochMilli();
			long endTime = LocalDateTime.of(2024, 3, 3, 2, 2, 2).toInstant(ZoneOffset.ofHours(8)).toEpochMilli();

			double expectDays = (double) (ONE_DAY_MILLISECONDS - ONE_HOUR_MILLISECONDS - ONE_MINUTE_MILLISECONDS - 1000)
					/ ONE_DAY_MILLISECONDS;
			expectDays = BigDecimal.valueOf(expectDays).setScale(2, RoundingMode.HALF_UP).doubleValue();

			double days = workDay.calculateWorkDaysToTwoScale(startTime, endTime, CalendarTypeEnum.REGULAR, ZoneId.of("Asia/Shanghai"));

			Assertions.assertEquals(expectDays, days);
		}

		@Test
		void shouldReturnRightWorkDaysWhenCalculateWorkDaysToTwoScaleAndStartIsNonWorkDayAndEndIsWorkDay() {
			long startTime = LocalDateTime.of(2024, 3, 2, 1, 1, 1).toInstant(ZoneOffset.ofHours(8)).toEpochMilli();
			long endTime = LocalDateTime.of(2024, 3, 4, 2, 2, 2).toInstant(ZoneOffset.ofHours(8)).toEpochMilli();

			double expectDays = (double) (2 * ONE_HOUR_MILLISECONDS + 2 * ONE_MINUTE_MILLISECONDS + 2 * 1000)
					/ ONE_DAY_MILLISECONDS;
			expectDays = BigDecimal.valueOf(expectDays).setScale(2, RoundingMode.HALF_UP).doubleValue();

			double days = workDay.calculateWorkDaysToTwoScale(startTime, endTime,CalendarTypeEnum.REGULAR , ZoneId.of("Asia/Shanghai"));

			Assertions.assertEquals(expectDays, days);
		}

		@Test
		void shouldReturnRightWorkDaysWhenCalculateWorkDaysToTwoScaleAndStartIsNonWorkDayAndEndIsNonWorkDay() {
			long startTime = LocalDateTime.of(2024, 3, 2, 1, 1, 1).toInstant(ZoneOffset.UTC).toEpochMilli();
			long endTime = LocalDateTime.of(2024, 3, 3, 2, 2, 2).toInstant(ZoneOffset.UTC).toEpochMilli();

			double expectDays = 0;
			expectDays = BigDecimal.valueOf(expectDays).setScale(2, RoundingMode.HALF_UP).doubleValue();

			double days = workDay.calculateWorkDaysToTwoScale(startTime, endTime, CalendarTypeEnum.REGULAR, ZoneId.of("Asia/Shanghai"));

			Assertions.assertEquals(expectDays, days);
		}

	}

	@Nested
	class CalculateWorkDaysBetweenMaybeWorkInWeekend {

		@BeforeEach
		void setup() {
			CalendarTypeEnum calendarType = CalendarTypeEnum.CN;

			Map<String, Boolean> holidayMap = Map.of("2024-04-04", true, "2024-04-05", true, "2024-04-06", true,
					"2024-04-07", false, "2024-05-01", true, "2024-05-02", true, "2024-05-03", true, "2024-05-04", true,
					"2024-05-05", true);

			when(holidayFactory.build(calendarType)).thenReturn(chinaHoliday);
			when(chinaHoliday.loadHolidayList("2024")).thenReturn(holidayMap);

			workDay.selectCalendarType(CalendarTypeEnum.CN);
		}

		@Test
		void startIsWorkdayAndEndIsWorkday() {
			long startTime = LocalDateTime.of(2024, 3, 11, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 15, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (15 - 11) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 0;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN , ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsWorkdayAndAcrossWeekend() {
			long startTime = LocalDateTime.of(2024, 3, 11, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 29, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (29 - 11 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime,CalendarTypeEnum.CN , ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsWorkdayAndAcrossHoliday() {

			long startTime = LocalDateTime.of(2024, 4, 3, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 4, 7, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (7 - 3 - 3) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 3;

			workDay.selectCalendarType(CalendarTypeEnum.CN);

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN, ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsSaturdayAndAcrossWeekend() {
			long startTime = LocalDateTime.of(2024, 3, 11, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 30, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (30 - 11 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN, ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsSundayAndAcrossWeekend() {
			long startTime = LocalDateTime.of(2024, 3, 11, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 31, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (31 - 11 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN, ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsSaturdayAndEndIsWorkdayAndAcrossWeekend() {
			long startTime = LocalDateTime.of(2024, 3, 9, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 29, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (29 - 9 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN, ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartAndEndIsTheSameDayAndIsSaturday() {
			long startTime = LocalDateTime.of(2024, 3, 9, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 9, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS + 1000;
			long expectHoliday = 0;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN, ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsSaturdayAndEndIsSunday() {
			long startTime = LocalDateTime.of(2024, 3, 9, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 10, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (10 - 9) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 0;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime,CalendarTypeEnum.CN , ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsSundayAndEndIsWorkdayAndAcrossWeekend() {
			long startTime = LocalDateTime.of(2024, 3, 10, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 29, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (29 - 10 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN, ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsHolidayAndEndIsWorkday() {

			long startTime = LocalDateTime.of(2024, 5, 1, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 5, 6, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = (6 - 1) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 0;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN, ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsHoliday() {

			long startTime = LocalDateTime.of(2024, 4, 28, 1, 10, 11).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;
			long endTime = LocalDateTime.of(2024, 5, 3, 2, 11, 12).toEpochSecond(ZoneOffset.ofHours(8)) * 1000;

			long expectWorkTime = 5 * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS + 1000;
			long expectHoliday = 0;

			WorkInfo works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime, CalendarTypeEnum.CN, ZoneId.of("Asia/Shanghai"));
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

	}

}
