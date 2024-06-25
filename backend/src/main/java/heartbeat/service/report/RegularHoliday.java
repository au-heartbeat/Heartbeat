package heartbeat.service.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class RegularHoliday extends AbstractCountryHoliday {

	public RegularHoliday(ObjectMapper objectMapper) {
		super(objectMapper);
	}

	@Override
	public Map<String, Boolean> loadHolidayList(String year) {
		return Map.of();
	}

}
