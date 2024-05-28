package heartbeat.service.report;

import heartbeat.client.HolidayFeignClient;
import heartbeat.client.dto.board.jira.HolidayDTO;
import heartbeat.service.report.model.WorkInfo;
import heartbeat.config.DayType;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
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

	public long calculateWorkDaysBetween(long startTime, long endTime, ZoneId timezone) {
		return calculateWorkTimeAndHolidayBetween(startTime, endTime, timezone, false, false).getWorkDays();
	}

	public WorkInfo calculateWorkTimeAndHolidayBetween(long startTime, long endTime, ZoneId timezone) {
		return calculateWorkTimeAndHolidayBetween(startTime, endTime, timezone, true, false);
	}

	private WorkInfo calculateWorkTimeAndHolidayBetween(long startTime, long endTime, ZoneId timezone,
			boolean holidayCanWork, boolean toScale) {
		long result = endTime - startTime;

		LocalDate startLocalDateTime = LocalDate.ofInstant(Instant.ofEpochMilli(startTime), timezone);
		LocalDate endLocalDateTime = LocalDate.ofInstant(Instant.ofEpochMilli(endTime), timezone);

		LocalDate localDateTimeIndex = LocalDate.of(startLocalDateTime.getYear(), startLocalDateTime.getMonth(),
				startLocalDateTime.getDayOfMonth());

		List<DayType> holidayTypeList = new ArrayList<>();

		while (!endLocalDateTime.isBefore(localDateTimeIndex)) {
			if (verifyIfThisDayHoliday(localDateTimeIndex)) {
				holidayTypeList.add(DayType.NON_WORK_DAY);
			}
			else {
				holidayTypeList.add(DayType.WORK_DAY);
			}
			localDateTimeIndex = localDateTimeIndex.plusDays(1);
		}

		long totalDays = holidayTypeList.size();

		if (holidayCanWork) {
			for (int i = 0; i < holidayTypeList.size() && holidayTypeList.get(i) == DayType.NON_WORK_DAY; i++) {
				holidayTypeList.set(i, DayType.WORK_DAY);
			}

			for (int i = holidayTypeList.size() - 1; i > 0 && holidayTypeList.get(i) == DayType.NON_WORK_DAY; i--) {
				holidayTypeList.set(i, DayType.WORK_DAY);
			}
		}
		else {
			long newStartTime = startTime;
			int startTimeIndex = 0;
			int endTimeIndex = holidayTypeList.size() - 1;

			if (holidayTypeList.get(startTimeIndex) == DayType.NON_WORK_DAY) {
				while (startTimeIndex < holidayTypeList.size()
						&& holidayTypeList.get(startTimeIndex) == DayType.NON_WORK_DAY) {
					startTimeIndex++;
				}
				LocalDate newStartLocalDateTime = startLocalDateTime.plusDays(startTimeIndex);
				newStartTime = newStartLocalDateTime.atStartOfDay(timezone).toInstant().toEpochMilli();
			}

			long newEndTime = endTime;
			if (holidayTypeList.get(endTimeIndex) == DayType.NON_WORK_DAY) {
				while (endTimeIndex >= startTimeIndex && holidayTypeList.get(endTimeIndex) == DayType.NON_WORK_DAY) {
					endTimeIndex--;
				}
				LocalDate newEndLocalDateTime = startLocalDateTime.plusDays(endTimeIndex + 1);
				newEndTime = newEndLocalDateTime.atStartOfDay(timezone).toInstant().toEpochMilli();
			}
			result = newEndTime - newStartTime;
			if (toScale) {
				holidayTypeList = holidayTypeList.subList(startTimeIndex, endTimeIndex + 1);
			}
		}
		long holidayNums = holidayTypeList.stream().filter(it -> it.equals(DayType.NON_WORK_DAY)).count();
		result = result - holidayNums * ONE_DAY;

		return WorkInfo.builder().holidays(holidayNums).totalDays(totalDays).workTime(result).build();
	}

	public double calculateWorkDaysToTwoScale(long startTime, long endTime, ZoneId timezone) {
		double days = (double) calculateWorkTimeAndHolidayBetween(startTime, endTime, timezone, false, true)
			.getWorkTime() / ONE_DAY;
		return BigDecimal.valueOf(days).setScale(2, RoundingMode.HALF_UP).doubleValue();
	}

}
