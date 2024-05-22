package heartbeat.service.report;

import heartbeat.client.HolidayFeignClient;
import heartbeat.client.dto.board.jira.HolidayDTO;
import heartbeat.service.report.model.WorkTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Log4j2
@Component
@RequiredArgsConstructor
public class WorkDay {

	private static final long ONE_DAY = 1000L * 60 * 60 * 24;

	private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

	private final HolidayFeignClient holidayFeignClient;

	private Map<String, Boolean> holidayMap = new HashMap<>();

	private void loadHolidayList(String year) {
		log.info("Start to get chinese holiday by year: {}", year);
		List<HolidayDTO> tempHolidayList = holidayFeignClient.getHolidays(year).getDays();
		log.info("Successfully get holiday list:{}", tempHolidayList);

		for (HolidayDTO tempHoliday : tempHolidayList) {
			holidayMap.put(tempHoliday.getDate(), tempHoliday.getIsOffDay());
		}
	}

	public void changeConsiderHolidayMode(boolean considerHoliday) {
		if (!considerHoliday) {
			holidayMap = new HashMap<>();
		}
		else if (holidayMap.size() == 0) {
			loadHolidayList(String.valueOf(Calendar.getInstance().get(Calendar.YEAR)));
		}
	}

	public boolean verifyIfThisDayHoliday(LocalDate localDate) {
		String localDateString = localDate.toString();
		if (holidayMap.containsKey(localDateString)) {
			return holidayMap.get(localDateString);
		}
		return localDate.getDayOfWeek() == DayOfWeek.SATURDAY || localDate.getDayOfWeek() == DayOfWeek.SUNDAY;
	}

	public boolean verifyIfThisDayHoliday(long time) {
		String dateString = convertTimeToDateString(time);
		if (holidayMap.containsKey(dateString)) {
			return holidayMap.get(dateString);
		}
		LocalDate date = LocalDate.ofEpochDay(time / ONE_DAY);
		return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
	}

	public int calculateWorkDaysBetween(long startTime, long endTime) {
		LocalDate startLocalDate = LocalDate.ofEpochDay(startTime / ONE_DAY);
		LocalDate endLocalDate = LocalDate.ofEpochDay(endTime / ONE_DAY);
		LocalDate nextLocalDate = startLocalDate.plusDays(0);

		int days = 0;
		while (!endLocalDate.isBefore(nextLocalDate)) {
			if (!verifyIfThisDayHoliday(nextLocalDate)) {
				days++;
			}
			nextLocalDate = nextLocalDate.plusDays(1);
		}
		return days;
	}

	public WorkTime calculateWorkTimeAndHolidayBetween(long startTime, long endTime) {
		long result = endTime - startTime;

		LocalDate startLocalDateTime;
		LocalDate endLocalDateTime;
		startLocalDateTime = LocalDate.ofInstant(Instant.ofEpochMilli(startTime), ZoneId.systemDefault());
		endLocalDateTime = LocalDate.ofInstant(Instant.ofEpochMilli(endTime), ZoneId.systemDefault());

		List<Integer> holidayTypeList = new ArrayList<>();
		LocalDate nextLocalDateTime = startLocalDateTime.plusDays(0);

		while (!endLocalDateTime.isBefore(nextLocalDateTime)) {
			if (verifyIfThisDayHoliday(nextLocalDateTime)) {
				holidayTypeList.add(0);
			}
			else {
				holidayTypeList.add(1);
			}
			nextLocalDateTime = nextLocalDateTime.plusDays(1);
		}

		for (int i = 0; i < holidayTypeList.size() && holidayTypeList.get(i) == 0; i++) {
			holidayTypeList.set(i, 1);
		}

		for (int i = holidayTypeList.size() - 1; i >= 0 && holidayTypeList.get(i) == 0; i--) {
			holidayTypeList.set(i, 1);
		}

		long holidayNums = holidayTypeList.stream().filter(it -> it == 0).count();
		result = result - holidayNums * ONE_DAY;

		return WorkTime.builder().holidays(holidayNums).workTime(result).build();
	}

	public double calculateWorkDaysBy24Hours(long startTime, long endTime) {
		long realStartTime = getNextNearestWorkingTime(startTime);
		long realEndTime = getNextNearestWorkingTime(endTime);
		long gapDaysTime = realEndTime - (realEndTime % ONE_DAY) - (realStartTime - (realStartTime % ONE_DAY));
		long gapWorkingDaysTime = (calculateWorkDaysBetween(realStartTime, realEndTime) - 1) * ONE_DAY;
		double days = (double) (realEndTime - realStartTime - gapDaysTime + gapWorkingDaysTime) / ONE_DAY;
		return BigDecimal.valueOf(days).setScale(2, RoundingMode.HALF_UP).doubleValue();
	}

	private static String convertTimeToDateString(long time) {
		LocalDate date = LocalDate.ofEpochDay(time / ONE_DAY);
		return date.format(DATE_FORMATTER);
	}

	private long getNextNearestWorkingTime(long time) {
		long nextWorkingTime = time;
		while (verifyIfThisDayHoliday(nextWorkingTime)) {
			nextWorkingTime += ONE_DAY;
			nextWorkingTime = nextWorkingTime - (nextWorkingTime % ONE_DAY);
		}
		return nextWorkingTime;
	}

}
