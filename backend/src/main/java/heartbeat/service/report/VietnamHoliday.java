package heartbeat.service.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import heartbeat.client.CalendarificFeignClient;
import heartbeat.client.dto.board.jira.CalendarificHolidayResponseDTO;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import heartbeat.exception.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class VietnamHoliday extends AbstractCountryHoliday {

	private final CalendarificFeignClient calendarificFeignClient;

	@Autowired
	public VietnamHoliday(ObjectMapper objectMapper, CalendarificFeignClient calendarificFeignClient) {
		super(objectMapper);
		this.calendarificFeignClient = calendarificFeignClient;
	}

	public Map<String, Boolean> loadHolidayList(String year) {
		Map<String, Boolean> holidayMap = new HashMap<>();
		log.info("Start to get vietnam holiday by year: {}", year);

		try {
			List<CalendarificHolidayResponseDTO.Response.CalendarificHolidayDetail> holidays = decoder(
					calendarificFeignClient.getHolidays(CalendarTypeEnum.VN.getValue().toLowerCase(), year),
					CalendarTypeEnum.VN, year, CalendarificHolidayResponseDTO.class)
				.getResponse()
				.getHolidays();
			log.info("Successfully get vietnam holiday list:{}", holidays);

			holidays.forEach(holiday -> {
				String date = holiday.getDate().getIso();
				if (holiday.getType().contains("National holiday")) {
					holidayMap.put(date, true);
				}
			});
			return holidayMap;
		}
		catch (NotFoundException e) {
			return new HashMap<>();
		}

	}

}
