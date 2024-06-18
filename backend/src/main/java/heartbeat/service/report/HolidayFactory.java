package heartbeat.service.report;

import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import org.springframework.stereotype.Component;

@Component
public class HolidayFactory {

	private final VietnamHoliday vietnamHoliday;

	private final ChinaHoliday chinaHoliday;

	private final RegularHoliday regularHoliday;

	public HolidayFactory(VietnamHoliday vietnamHoliday, ChinaHoliday chinaHoliday, RegularHoliday regularHoliday) {
		this.vietnamHoliday = vietnamHoliday;
		this.chinaHoliday = chinaHoliday;
		this.regularHoliday = regularHoliday;
	}

	private AbstractCountryHoliday dispatch(CalendarTypeEnum calendarType) {
		switch (calendarType) {
			case CN -> {
				return chinaHoliday;
			}
			case VN -> {
				return vietnamHoliday;
			}
			default -> {
				return regularHoliday;
			}
		}
	}

	public AbstractCountryHoliday build(CalendarTypeEnum calendarType) {
		return dispatch(calendarType);
	}

}
