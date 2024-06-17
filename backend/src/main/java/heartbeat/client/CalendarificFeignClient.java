package heartbeat.client;

import heartbeat.client.decoder.CalendarFeignClientDecoder;
import heartbeat.client.dto.board.jira.CalendarificHolidayResponseDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "CalendarificFeignClient", url = "${calendarific.url}", configuration = CalendarFeignClientDecoder.class)
public interface CalendarificFeignClient {
	@Cacheable(cacheNames = "calendarificResult", key = "'calendarific-' + #country + '-' + #year")
	@GetMapping(path = "/holidays")
	CalendarificHolidayResponseDTO getHolidays(@RequestParam String country, @RequestParam String year, @RequestParam("api_key") String apiKey);
}
