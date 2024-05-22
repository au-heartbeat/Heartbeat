package heartbeat.service.report;

import heartbeat.client.HolidayFeignClient;
import heartbeat.client.dto.board.jira.HolidayDTO;
import heartbeat.client.dto.board.jira.HolidaysResponseDTO;
import heartbeat.service.report.model.WorkTime;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkDayTest {

	private static final long ONE_DAY_MILLISECONDS = 1000L * 60 * 60 * 24;

	private static final long ONE_HOUR_MILLISECONDS = 1000L * 60 * 60;

	private static final long ONE_MINUTE_MILLISECONDS = 1000L * 60;

	@InjectMocks
	WorkDay workDay;

	@Mock
	HolidayFeignClient holidayFeignClient;

	@Test
	void shouldReturnDayIsHoliday() {
		List<HolidayDTO> holidayDTOList = List.of(
				HolidayDTO.builder().date("2023-01-01").name("元旦").isOffDay(true).build(),
				HolidayDTO.builder().date("2023-01-28").name("春节").isOffDay(false).build());

		long holidayTime = LocalDate.parse("2023-01-01", DateTimeFormatter.ISO_DATE)
			.atStartOfDay(ZoneOffset.UTC)
			.toInstant()
			.toEpochMilli();

		long workdayTime = LocalDate.parse("2023-01-28", DateTimeFormatter.ISO_DATE)
			.atStartOfDay(ZoneOffset.UTC)
			.toInstant()
			.toEpochMilli();

		when(holidayFeignClient.getHolidays(any()))
			.thenReturn(HolidaysResponseDTO.builder().days(holidayDTOList).build());

		workDay.changeConsiderHolidayMode(true);
		boolean resultWorkDay = workDay.verifyIfThisDayHoliday(holidayTime);
		boolean resultHoliday = workDay.verifyIfThisDayHoliday(workdayTime);

		Assertions.assertTrue(resultWorkDay);
		Assertions.assertFalse(resultHoliday);
	}

	@Test
	void shouldReturnDayIsHolidayWithoutChineseHoliday() {

		long holidayTime = LocalDate.parse("2023-01-01", DateTimeFormatter.ISO_DATE)
			.atStartOfDay(ZoneOffset.UTC)
			.toInstant()
			.toEpochMilli();

		long workdayTime = LocalDate.parse("2023-01-28", DateTimeFormatter.ISO_DATE)
			.atStartOfDay(ZoneOffset.UTC)
			.toInstant()
			.toEpochMilli();

		workDay.changeConsiderHolidayMode(false);
		boolean resultWorkDay = workDay.verifyIfThisDayHoliday(holidayTime);
		boolean resultHoliday = workDay.verifyIfThisDayHoliday(workdayTime);

		Assertions.assertTrue(resultWorkDay);
		Assertions.assertTrue(resultHoliday);
	}

	@Test
	void shouldReturnRightWorkDaysWhenCalculateWorkDaysBetween() {

		int result = workDay.calculateWorkDaysBetween(WorkDayFixture.START_TIME(), WorkDayFixture.END_TIME());
		int resultNewYear = workDay.calculateWorkDaysBetween(WorkDayFixture.START_TIME_NEW_YEAR(),
				WorkDayFixture.END_TIME_NEW_YEAR());

		Assertions.assertEquals(23, result);
		Assertions.assertEquals(22, resultNewYear);
	}

	@Test
	void shouldReturnRightWorkDaysWhenCalculateWorkDaysBy24Hours() {

		double days = workDay.calculateWorkDaysBy24Hours(WorkDayFixture.START_TIME(), WorkDayFixture.END_TIME());

		Assertions.assertEquals(23, days);
	}

	@Nested
	class CalculateWorkDaysBetweenMaybeWorkInWeekend {

		@Test
		void startIsWorkdayAndEndIsWorkdayAndMills() {
			long startTime = LocalDateTime.of(2024, 3, 11, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 15, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (15 - 11) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 0;

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsWorkdayAndAcrossWeekendAndMills() {
			long startTime = LocalDateTime.of(2024, 3, 11, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 29, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (29 - 11 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsWorkdayAndAcrossHolidayAndMills() {
			List<HolidayDTO> holidayDTOList = List.of(
					HolidayDTO.builder().date("2024-04-04").name("清明").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-04-05").name("清明").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-04-06").name("清明").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-04-07").name("清明").isOffDay(false).build());

			long startTime = LocalDateTime.of(2024, 4, 3, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 4, 7, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (7 - 3 - 3) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 3;

			when(holidayFeignClient.getHolidays("2024"))
				.thenReturn(HolidaysResponseDTO.builder().days(holidayDTOList).build());
			workDay.changeConsiderHolidayMode(true);

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsSundayAndEndIsWorkdayAndAcrossWeekendAndMills() {
			long startTime = LocalDateTime.of(2024, 3, 10, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 29, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (29 - 10 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsSaturdayAndEndIsWorkdayAndAcrossWeekendAndMills() {
			long startTime = LocalDateTime.of(2024, 3, 9, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 29, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (29 - 9 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsSaturdayAndAcrossWeekendAndMills() {
			long startTime = LocalDateTime.of(2024, 3, 11, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 30, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (30 - 11 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsSundayAndAcrossWeekendAndMills() {
			long startTime = LocalDateTime.of(2024, 3, 11, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 31, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (31 - 11 - 4) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 4;

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsSaturdayAndEndIsSundayAndMills() {
			long startTime = LocalDateTime.of(2024, 3, 9, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 10, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (10 - 9) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 0;

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartAndEndIsTheSameDayAndIsSaturdayAndMills() {
			long startTime = LocalDateTime.of(2024, 3, 9, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 3, 9, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS + 1000;
			long expectHoliday = 0;

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsHolidayAndEndIsWorkdayAndMills() {
			List<HolidayDTO> holidayDTOList = List.of(
					HolidayDTO.builder().date("2024-05-01").name("五一").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-05-02").name("五一").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-05-03").name("五一").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-05-04").name("五一").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-05-05").name("五一").isOffDay(true).build());

			long startTime = LocalDateTime.of(2024, 5, 1, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 5, 6, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = (6 - 1) * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS
					+ 1000;
			long expectHoliday = 0;

			when(holidayFeignClient.getHolidays("2024"))
				.thenReturn(HolidaysResponseDTO.builder().days(holidayDTOList).build());
			workDay.changeConsiderHolidayMode(true);

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

		@Test
		void StartIsWorkdayAndEndIsHolidayAndMills() {
			List<HolidayDTO> holidayDTOList = List.of(
					HolidayDTO.builder().date("2024-05-01").name("五一").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-05-02").name("五一").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-05-03").name("五一").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-05-04").name("五一").isOffDay(true).build(),
					HolidayDTO.builder().date("2024-05-05").name("五一").isOffDay(true).build());

			long startTime = LocalDateTime.of(2024, 4, 28, 1, 10, 11).toEpochSecond(ZoneOffset.UTC) * 1000;
			long endTime = LocalDateTime.of(2024, 5, 3, 2, 11, 12).toEpochSecond(ZoneOffset.UTC) * 1000;

			long expectWorkTime = 5 * ONE_DAY_MILLISECONDS + ONE_HOUR_MILLISECONDS + ONE_MINUTE_MILLISECONDS + 1000;
			long expectHoliday = 0;

			when(holidayFeignClient.getHolidays("2024"))
				.thenReturn(HolidaysResponseDTO.builder().days(holidayDTOList).build());
			workDay.changeConsiderHolidayMode(true);

			WorkTime works = workDay.calculateWorkTimeAndHolidayBetween(startTime, endTime);
			long workTime = works.getWorkTime();
			long holidays = works.getHolidays();

			Assertions.assertEquals(expectWorkTime, workTime);
			Assertions.assertEquals(expectHoliday, holidays);
		}

	}

}
