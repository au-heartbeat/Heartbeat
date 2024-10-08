package heartbeat.util;

import heartbeat.controller.board.dto.request.CardStepsEnum;
import heartbeat.controller.board.dto.response.CycleTimeInfo;
import heartbeat.controller.board.dto.response.StatusChangedItem;
import heartbeat.controller.board.dto.response.StatusTimeStamp;
import heartbeat.controller.report.dto.request.CalendarTypeEnum;
import heartbeat.service.report.WorkDay;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BoardUtil {

	private final WorkDay workDay;

	public List<CycleTimeInfo> getOriginCycleTimeInfos(List<StatusChangedItem> statusChangedArray,
			Boolean treatFlagCardAsBlock, CalendarTypeEnum calendarTypeEnum, ZoneId timezone) {
		List<StatusTimeStamp> flagTimeStamp = getFlagTimeStamps(statusChangedArray);
		List<StatusTimeStamp> columnTimeStamp = getColumnTimeStamps(statusChangedArray);
		List<CycleTimeInfo> originCycleTimeInfos = calculateOriginCycleTime(flagTimeStamp, columnTimeStamp,
				treatFlagCardAsBlock, calendarTypeEnum, timezone);
		return getCollectRemovedDuplicates(originCycleTimeInfos);
	}

	public List<CycleTimeInfo> getCycleTimeInfos(List<StatusChangedItem> statusChangedArray,
			List<String> realDoneStatus, Boolean treatFlagCardAsBlock, CalendarTypeEnum calendarTypeEnum,
			ZoneId timezone) {
		List<StatusChangedItem> statusChangedByFiltered;
		if (treatFlagCardAsBlock) {
			statusChangedByFiltered = statusChangedArray;
		}
		else {
			statusChangedByFiltered = statusChangedArray.stream()
				.filter(item -> !(CardStepsEnum.FLAG.getValue().equals(item.getStatus())
						|| CardStepsEnum.REMOVEFLAG.getValue().equals(item.getStatus())))
				.collect(Collectors.toList());
		}

		List<StatusChangedItem> statusChangedBySorted = getStatusChangedBySorted(statusChangedByFiltered);
		List<StatusTimeStamp> flagTimeStamp = getFlagTimeStamps(statusChangedBySorted);
		List<StatusTimeStamp> columnTimeStamp = getColumnTimeStamps(statusChangedBySorted);

		List<CycleTimeInfo> cycleTimeInfos = calculateCycleTime(realDoneStatus, flagTimeStamp, columnTimeStamp,
				calendarTypeEnum, timezone);

		return getCollectRemovedDuplicates(cycleTimeInfos);
	}

	private List<CycleTimeInfo> calculateOriginCycleTime(List<StatusTimeStamp> flagTimeStamp,
			List<StatusTimeStamp> columnTimeStamp, Boolean treatFlagCardAsBlock, CalendarTypeEnum calendarTypeEnum,
			ZoneId timezone) {
		List<CycleTimeInfo> originCycleTimeInfos = new ArrayList<>();

		for (StatusTimeStamp columnTimeStampItem : columnTimeStamp) {
			double originColumnTimeInDays = workDay.calculateWorkDaysToTwoScale(columnTimeStampItem.getStartTimestamp(),
					columnTimeStampItem.getEndTimestamp(), calendarTypeEnum, timezone);
			originCycleTimeInfos.add(CycleTimeInfo.builder()
				.day(originColumnTimeInDays)
				.column(columnTimeStampItem.getStatus().toUpperCase())
				.build());
		}

		if (Boolean.TRUE.equals(treatFlagCardAsBlock)) {
			double totalFlagTimeInDays = calculateTotalFlagCycleTime(flagTimeStamp, calendarTypeEnum, timezone);
			originCycleTimeInfos
				.add(CycleTimeInfo.builder().day(totalFlagTimeInDays).column(CardStepsEnum.FLAG.getValue()).build());
			originCycleTimeInfos = originCycleTimeInfos.stream()
				.filter(it -> !Objects.equals(it.getColumn(), CardStepsEnum.BLOCK.getValue().toUpperCase()))
				.toList();
		}

		return originCycleTimeInfos;
	}

	private List<CycleTimeInfo> calculateCycleTime(List<String> realDoneStatus, List<StatusTimeStamp> flagTimeStamp,
			List<StatusTimeStamp> columnTimeStamp, CalendarTypeEnum calendarTypeEnum, ZoneId timezone) {
		List<CycleTimeInfo> cycleTimeInfos = new ArrayList<>();
		double totalFlagTimeInDays = calculateTotalFlagCycleTime(flagTimeStamp, calendarTypeEnum, timezone);
		double totalFlagAndRealDoneOverlapTime = calculateTotalFlagAndRealDoneOverlapTime(realDoneStatus, flagTimeStamp,
				columnTimeStamp, calendarTypeEnum, timezone);
		for (StatusTimeStamp columnTimeStampItem : columnTimeStamp) {
			double originColumnTimeInDays = workDay.calculateWorkDaysToTwoScale(columnTimeStampItem.getStartTimestamp(),
					columnTimeStampItem.getEndTimestamp(), calendarTypeEnum, timezone);
			double realColumnTimeInDays;

			if (realDoneStatus.contains(columnTimeStampItem.getStatus().toUpperCase())) {
				realColumnTimeInDays = originColumnTimeInDays;
			}
			else {
				double totalOverlapTimeInDays = calculateTotalOverlapTime(columnTimeStampItem, flagTimeStamp,
						calendarTypeEnum, timezone);
				if (Objects.equals(columnTimeStampItem.getStatus(), CardStepsEnum.BLOCK.getValue().toUpperCase())) {
					realColumnTimeInDays = originColumnTimeInDays + totalFlagTimeInDays - totalOverlapTimeInDays
							- totalFlagAndRealDoneOverlapTime;
				}
				else {
					realColumnTimeInDays = originColumnTimeInDays - totalOverlapTimeInDays;
				}
			}

			cycleTimeInfos.add(CycleTimeInfo.builder()
				.day(realColumnTimeInDays)
				.column(columnTimeStampItem.getStatus().toUpperCase())
				.build());
		}
		if (!isBlockColumnExisted(columnTimeStamp) && totalFlagTimeInDays > 0) {
			double blockDays = totalFlagTimeInDays - totalFlagAndRealDoneOverlapTime;
			cycleTimeInfos.add(
					CycleTimeInfo.builder().day(blockDays).column(CardStepsEnum.FLAG.getValue().toUpperCase()).build());
		}

		return cycleTimeInfos;
	}

	private boolean isBlockColumnExisted(List<StatusTimeStamp> columnTimeStamp) {
		for (StatusTimeStamp columnTimeStampItem : columnTimeStamp) {
			if (Objects.equals(columnTimeStampItem.getStatus(), CardStepsEnum.BLOCK.getValue().toUpperCase())) {
				return true;
			}
		}
		return false;
	}

	private double calculateTotalFlagAndRealDoneOverlapTime(List<String> realDoneStatus,
			List<StatusTimeStamp> flagTimeStamp, List<StatusTimeStamp> columnTimeStamp,
			CalendarTypeEnum calendarTypeEnum, ZoneId timezone) {
		double totalFlagAndRealDoneColumnOverlapTime = 0.0;
		for (StatusTimeStamp columnTimeStampItem : columnTimeStamp) {
			if (realDoneStatus.contains(columnTimeStampItem.getStatus().toUpperCase())) {
				totalFlagAndRealDoneColumnOverlapTime += calculateTotalOverlapTime(columnTimeStampItem, flagTimeStamp,
						calendarTypeEnum, timezone);
			}
		}
		return totalFlagAndRealDoneColumnOverlapTime;
	}

	private static List<StatusChangedItem> getStatusChangedBySorted(List<StatusChangedItem> statusChangedArray) {
		return statusChangedArray.stream().sorted(Comparator.comparingLong(StatusChangedItem::getTimestamp)).toList();
	}

	private List<StatusTimeStamp> getColumnTimeStamps(List<StatusChangedItem> statusChangedBySorted) {
		List<StatusChangedItem> columnChangedArray = new ArrayList<>();
		for (StatusChangedItem statusChangedItem : statusChangedBySorted) {
			if (!Objects.equals(statusChangedItem.getStatus(), CardStepsEnum.FLAG.getValue())
					&& !Objects.equals(statusChangedItem.getStatus(), CardStepsEnum.REMOVEFLAG.getValue())) {
				columnChangedArray.add(statusChangedItem);
			}
		}
		return getStatusTimeStamp(columnChangedArray);
	}

	private List<StatusTimeStamp> getFlagTimeStamps(List<StatusChangedItem> statusChangedBySorted) {
		List<StatusChangedItem> flagChangedArray = new ArrayList<>();
		for (StatusChangedItem statusChangedItem : statusChangedBySorted) {
			if (Objects.equals(statusChangedItem.getStatus(), CardStepsEnum.FLAG.getValue())
					|| Objects.equals(statusChangedItem.getStatus(), CardStepsEnum.REMOVEFLAG.getValue())) {
				flagChangedArray.add(statusChangedItem);
			}
		}
		return getStatusTimeStamp(flagChangedArray);
	}

	private double calculateTotalOverlapTime(StatusTimeStamp columnTimeStampItem, List<StatusTimeStamp> flagTimeStamp,
			CalendarTypeEnum calendarTypeEnum, ZoneId timezone) {
		double totalOverlapTimeInDays = 0.0;

		for (StatusTimeStamp flagTimeStampItem : flagTimeStamp) {
			StatusTimeStamp overlapTime = calculateOverlapTime(columnTimeStampItem, flagTimeStampItem);

			if (overlapTime.getStartTimestamp() < overlapTime.getEndTimestamp()) {
				double overlapTimeInDays = workDay.calculateWorkDaysToTwoScale(overlapTime.getStartTimestamp(),
						overlapTime.getEndTimestamp(), calendarTypeEnum, timezone);
				totalOverlapTimeInDays += overlapTimeInDays;
			}
		}

		return totalOverlapTimeInDays;
	}

	private double calculateTotalFlagCycleTime(List<StatusTimeStamp> flagTimeStamp, CalendarTypeEnum calendarTypeEnum,
			ZoneId timezone) {
		double totalFlagTimeInDays = 0.0;

		for (StatusTimeStamp flagTimeStampItem : flagTimeStamp) {
			double flagTimeInDays = workDay.calculateWorkDaysToTwoScale(flagTimeStampItem.getStartTimestamp(),
					flagTimeStampItem.getEndTimestamp(), calendarTypeEnum, timezone);
			totalFlagTimeInDays += flagTimeInDays;
		}

		return totalFlagTimeInDays;
	}

	private StatusTimeStamp calculateOverlapTime(StatusTimeStamp columnTimeStampItem,
			StatusTimeStamp flagTimeStampItem) {
		long startTimestamp = Math.max(columnTimeStampItem.getStartTimestamp(), flagTimeStampItem.getStartTimestamp());
		long endTimestamp = Math.min(columnTimeStampItem.getEndTimestamp(), flagTimeStampItem.getEndTimestamp());

		return StatusTimeStamp.builder().startTimestamp(startTimestamp).endTimestamp(endTimestamp).build();
	}

	private static List<CycleTimeInfo> getCollectRemovedDuplicates(List<CycleTimeInfo> cycleTimeInfos) {
		return cycleTimeInfos.stream()
			.collect(Collectors.groupingBy(CycleTimeInfo::getColumn))
			.entrySet()
			.stream()
			.map(entry -> CycleTimeInfo.builder()
				.column(entry.getKey())
				.day(entry.getValue().stream().map(CycleTimeInfo::getDay).mapToDouble(Double::doubleValue).sum())
				.build())
			.collect(Collectors.toList());
	}

	private List<StatusTimeStamp> getStatusTimeStamp(List<StatusChangedItem> statusChangedItems) {
		List<StatusTimeStamp> statusTimeStamps = new ArrayList<>();

		for (int i = 0; i < statusChangedItems.size(); i++) {
			StatusChangedItem flagChangedItem = statusChangedItems.get(i);
			if (!Objects.equals(flagChangedItem.getStatus(), CardStepsEnum.REMOVEFLAG.getValue())) {
				long columnEndTimestamp = getColumnEndTimestamp(i, statusChangedItems);
				statusTimeStamps.add(new StatusTimeStamp(flagChangedItem.getTimestamp(), columnEndTimestamp,
						flagChangedItem.getStatus()));
			}
		}

		return statusTimeStamps;
	}

	private long getColumnEndTimestamp(int index, List<StatusChangedItem> statusChangedItems) {
		if (index < statusChangedItems.size() - 1) {
			return statusChangedItems.get(index + 1).getTimestamp();
		}
		else {
			return System.currentTimeMillis();
		}
	}

}
