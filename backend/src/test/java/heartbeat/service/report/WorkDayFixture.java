package heartbeat.service.report;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public class WorkDayFixture {

	public static long START_TIME() {
		return LocalDate.parse("2020-01-01", DateTimeFormatter.ISO_DATE)
			.atStartOfDay(ZoneOffset.ofHours(8))
			.toInstant()
			.toEpochMilli();
	}

	public static long END_TIME() {
		return LocalDate.parse("2020-02-01", DateTimeFormatter.ISO_DATE)
			.atStartOfDay(ZoneOffset.ofHours(8))
			.toInstant()
			.toEpochMilli();
	}

	public static long START_TIME_NEW_YEAR() {
		return LocalDate.parse("2021-01-01", DateTimeFormatter.ISO_DATE)
			.atStartOfDay(ZoneOffset.ofHours(8))
			.toInstant()
			.toEpochMilli();
	}

	public static long END_TIME_NEW_YEAR() {
		return LocalDate.parse("2021-02-01", DateTimeFormatter.ISO_DATE)
			.atStartOfDay(ZoneOffset.ofHours(8))
			.toInstant()
			.toEpochMilli();
	}

}
