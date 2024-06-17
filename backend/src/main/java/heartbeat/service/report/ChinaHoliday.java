package heartbeat.service.report;

import heartbeat.client.HolidayFeignClient;
import heartbeat.client.dto.board.jira.HolidayDTO;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Log4j2
@Component
public class ChinaHoliday extends AbstractCountryHoliday {

	@Autowired
	private HolidayFeignClient holidayFeignClient;

	@Override
	public Map<String, Boolean> loadHolidayList(String year) {
		Map<String, Boolean> holidayMap = new HashMap<>();
		log.info("Start to get china holiday by year: {}", year);
		List<HolidayDTO> tempHolidayList = holidayFeignClient.getHolidays(year).getDays();
		log.info("Successfully get china holiday list:{}", tempHolidayList);

		for (HolidayDTO tempHoliday : tempHolidayList) {
			holidayMap.put(tempHoliday.getDate(), tempHoliday.getIsOffDay());
		}
		return holidayMap;
	}
}
