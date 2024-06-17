package heartbeat.service.report;

import heartbeat.client.CalendarificFeignClient;
import heartbeat.client.dto.board.jira.CalendarificHolidayResponseDTO;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class VietnamHoliday extends AbstractCountryHoliday {

	@Autowired
	private CalendarificFeignClient calendarificFeignClient;

	@Value("${calendarific.apiKey}")
	private String apiKey;

	public Map<String, Boolean> loadHolidayList(String year) {
		Map<String, Boolean> holidayMap = new HashMap<>();
		log.info("Start to get vietnam holiday by year: {}", year);
		List<CalendarificHolidayResponseDTO.Response.CalendarificHolidayDetail> holidays = calendarificFeignClient
			.getHolidays(CalendarTypeEnum.VN.getValue(), year, apiKey)
			.getResponse()
			.getHolidays();
		log.info("Successfully get vietnam holiday list:{}", holidays);

		holidays.forEach(holiday -> {
			String date = holiday.getDate().getIso();
			holidayMap.put(date, holiday.getType().contains("National holiday"));
		});
		return holidayMap;
	}

}
