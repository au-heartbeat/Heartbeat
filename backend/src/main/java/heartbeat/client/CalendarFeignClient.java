package heartbeat.client;

import heartbeat.client.decoder.CalendarFeignClientDecoder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(value = "CalendarFeignClient", url = "${calendar.url}", configuration = CalendarFeignClientDecoder.class)
public interface CalendarFeignClient {

	@Cacheable(cacheNames = "calendarResult", key = "'calendar-' + #country + '-' + #year")
	@GetMapping(path = "/{country}/{year}.json")
	String getHolidays(@PathVariable String country, @PathVariable String year);

}
