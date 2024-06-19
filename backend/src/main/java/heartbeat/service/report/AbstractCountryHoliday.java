package heartbeat.service.report;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import heartbeat.exception.DecodeCalendarException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public abstract class AbstractCountryHoliday {

	@Autowired
	private ObjectMapper objectMapper;

	public abstract Map<String, Boolean> loadHolidayList(String year);

	protected <T> T decoder(String value, CalendarTypeEnum calendarTypeEnum, String year, Class<T> clazz) {
		try {
			return objectMapper.readValue(value, clazz);
		}
		catch (JsonProcessingException e) {
			String msg = String.format("error decode %s-%s value to %s", year, calendarTypeEnum, clazz);
			log.error(msg);
			throw new DecodeCalendarException(msg, 500);
		}
	}

}
