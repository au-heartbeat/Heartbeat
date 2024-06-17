package heartbeat.service.report;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class RegularHoliday extends AbstractCountryHoliday {

	@Override
	public Map<String, Boolean> loadHolidayList(String year) {
		return Map.of();
	}
}
