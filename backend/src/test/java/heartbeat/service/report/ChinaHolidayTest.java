package heartbeat.service.report;

import heartbeat.client.HolidayFeignClient;
import heartbeat.client.dto.board.jira.HolidaysResponseDTO;
import heartbeat.util.JsonFileReader;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChinaHolidayTest {

	@Mock
	private HolidayFeignClient holidayFeignClient;

	@InjectMocks
	private ChinaHoliday chinaHoliday;

	@Test
	void loadHolidayListSuccess() {
		String year = "2024";
		HolidaysResponseDTO chinaHolidayDTO = JsonFileReader
			.readJsonFile("./src/test/resources/ChinaCalendarHolidayResponse.json", HolidaysResponseDTO.class);
		when(holidayFeignClient.getHolidays(year)).thenReturn(chinaHolidayDTO);

		Map<String, Boolean> result = chinaHoliday.loadHolidayList(year);

		assertEquals(result.size(), 2);
		assertTrue(result.get("2024-01-01"));
		assertFalse(result.get("2024-02-04"));
		verify(holidayFeignClient).getHolidays(year);
	}

}
