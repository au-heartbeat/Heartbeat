package heartbeat.service.report;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RegularHolidayTest {

	@InjectMocks
	public RegularHoliday regularHoliday;

	@Test
	void loadHolidayListSuccess() {
		String year = "2024";
		Map<String, Boolean> result = regularHoliday.loadHolidayList(year);

		assertEquals(0, result.size());
	}

}
