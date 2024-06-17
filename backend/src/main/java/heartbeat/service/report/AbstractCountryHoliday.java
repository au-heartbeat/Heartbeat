package heartbeat.service.report;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public abstract class AbstractCountryHoliday {

	abstract public Map<String, Boolean> loadHolidayList(String year);

}
