package heartbeat.client;

import heartbeat.client.decoder.CalendarFeignClientDecoder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(value = "CalendarificFeignClient", url = "${calendarific.url}",
		configuration = CalendarFeignClientDecoder.class)
public interface CalendarificFeignClient {

	@Cacheable(cacheNames = "calendarificResult", key = "'calendarific-' + #country + '-' + #year")
	@GetMapping(path = "/{country}/{year}.json")
	String getHolidays(@PathVariable String country, @PathVariable String year);

}
