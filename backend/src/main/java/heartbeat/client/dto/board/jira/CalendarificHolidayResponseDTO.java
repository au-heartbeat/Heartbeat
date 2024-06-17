package heartbeat.client.dto.board.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CalendarificHolidayResponseDTO implements Serializable {

	private Response response;

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Response implements Serializable {
		private List<CalendarificHolidayDetail> holidays;

		@Data
		@JsonIgnoreProperties(ignoreUnknown = true)
		public static class CalendarificHolidayDetail implements Serializable {
			private HolidayDateTime date;

			private List<String> type;

			@Data
			@JsonIgnoreProperties(ignoreUnknown = true)
			public static class HolidayDateTime implements Serializable {
				private String iso;
			}
		}
	}

}
