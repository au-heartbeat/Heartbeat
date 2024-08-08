package heartbeat.controller.board.dto.request;

import java.util.Map;
import java.util.Set;

public enum CardStepsEnum {

	TODO("To do", "To do"), ANALYSE("Analysis", "Analysis"), DESIGN("Design", "Design"),
	DEVELOPMENT("In Dev", "In dev"), BLOCK("Block", "Block"), FLAG("FLAG", "Flag"),
	REMOVEFLAG("removeFlag", "Remove flag"), REVIEW("Review", "Review"),
	WAITING_FOR_TESTING("Waiting for testing", "Waiting for testing"), TESTING("Testing", "Testing"),
	WAITING_FOR_DEVELOPMENT("Waiting for development", "Waiting for development"), DONE("Done", "Done"),
	CLOSED("Closed", "Closed"), UNKNOWN("UNKNOWN", "Unknown");

	private final String value;

	private final String alias;

	CardStepsEnum(String value, String alias) {
		this.value = value;
		this.alias = alias;
	}

	public String getValue() {
		return value;
	}

	public String getAlias() {
		return alias;
	}

	public static CardStepsEnum fromValue(String type) {
		for (CardStepsEnum cardStepsEnum : values()) {
			if (cardStepsEnum.value.equals(type)) {
				return cardStepsEnum;
			}
		}
		throw new IllegalArgumentException("Type does not find!");
	}

	public static final Map<CardStepsEnum, Set<CardStepsEnum>> reworkJudgmentMap = Map.of(TODO,
			Set.of(ANALYSE, DESIGN, DEVELOPMENT, BLOCK, FLAG, REVIEW, WAITING_FOR_TESTING, TESTING,
					WAITING_FOR_DEVELOPMENT, DONE),
			ANALYSE,
			Set.of(DESIGN, DEVELOPMENT, BLOCK, FLAG, REVIEW, WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEVELOPMENT,
					DONE),
			DESIGN,
			Set.of(DEVELOPMENT, BLOCK, FLAG, REVIEW, WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEVELOPMENT, DONE),
			DEVELOPMENT, Set.of(BLOCK, FLAG, REVIEW, WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEVELOPMENT, DONE),
			BLOCK, Set.of(REVIEW, WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEVELOPMENT, DONE), REVIEW,
			Set.of(WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEVELOPMENT, DONE), WAITING_FOR_TESTING,
			Set.of(TESTING, WAITING_FOR_DEVELOPMENT, DONE), TESTING, Set.of(WAITING_FOR_DEVELOPMENT, DONE),
			WAITING_FOR_DEVELOPMENT, Set.of(DONE));

}
