package heartbeat.controller.board.dto.request;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

public enum CardStepsEnum {

	TODO("To do"), ANALYSE("Analysis"), DEVELOPMENT("In Dev"), BLOCK("Block"), TESTING("Testing"), REVIEW("Review"),
	DONE("Done"), CLOSED("Closed"), WAITING("Waiting for testing"), FLAG("FLAG"), REMOVEFLAG("removeFlag"),
	UNKNOWN("UNKNOWN");

	private final String value;

	CardStepsEnum(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static CardStepsEnum fromValue(String type) {
		for (CardStepsEnum cardStepsEnum : values()) {
			if (cardStepsEnum.value.equals(type)) {
				return cardStepsEnum;
			}
		}
		throw new IllegalArgumentException("Type does not find!");
	}

	public static final Map<CardStepsEnum, Set<CardStepsEnum>> reworkJudgmentMap = new EnumMap<>(CardStepsEnum.class);

	static {
		reworkJudgmentMap.put(ANALYSE, Set.of(TODO, DEVELOPMENT, BLOCK, REVIEW, WAITING, TESTING, DONE));
		reworkJudgmentMap.put(TODO, Set.of(DEVELOPMENT, BLOCK, REVIEW, WAITING, TESTING, DONE));
		reworkJudgmentMap.put(DEVELOPMENT, Set.of(BLOCK, REVIEW, WAITING, TESTING, DONE));
		reworkJudgmentMap.put(BLOCK, Set.of(REVIEW, WAITING, TESTING, DONE));
		reworkJudgmentMap.put(REVIEW, Set.of(WAITING, TESTING, DONE));
		reworkJudgmentMap.put(WAITING, Set.of(TESTING, DONE));
		reworkJudgmentMap.put(TESTING, Set.of(DONE));
	}

}
