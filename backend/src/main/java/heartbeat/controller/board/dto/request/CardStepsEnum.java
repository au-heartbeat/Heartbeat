package heartbeat.controller.board.dto.request;

import java.util.Map;
import java.util.Set;

public enum CardStepsEnum {

	TODO("To do", "To do", 0), ANALYSE("Analysis", "Analysis", 1), DESIGN("Design", "Design", 2),
	DEVELOPMENT("In Dev", "In dev", 3), BLOCK("Block", "Block", 4), FLAG("FLAG", "Flag", 5),
	REMOVEFLAG("removeFlag", "Remove flag", 6), REVIEW("Review", "Review", 7),
	WAITING_FOR_TESTING("Waiting for testing", "Waiting for testing", 8), TESTING("Testing", "Testing", 9),
	WAITING_FOR_DEPLOYMENT("Waiting for deployment", "Waiting for deployment", 10), DONE("Done", "Done", 11),
	CLOSED("Closed", "Closed", 12), UNKNOWN("UNKNOWN", "Unknown", 13);

	private final String value;

	private final String alias;

	private final int order;

	CardStepsEnum(String value, String alias, int order) {
		this.value = value;
		this.alias = alias;
		this.order = order;
	}

	public String getValue() {
		return value;
	}

	public String getAlias() {
		return alias;
	}

	public int getOrder() {
		return order;
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
					WAITING_FOR_DEPLOYMENT, DONE),
			ANALYSE,
			Set.of(DESIGN, DEVELOPMENT, BLOCK, FLAG, REVIEW, WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEPLOYMENT,
					DONE),
			DESIGN,
			Set.of(DEVELOPMENT, BLOCK, FLAG, REVIEW, WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEPLOYMENT, DONE),
			DEVELOPMENT, Set.of(BLOCK, FLAG, REVIEW, WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEPLOYMENT, DONE), BLOCK,
			Set.of(REVIEW, WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEPLOYMENT, DONE), REVIEW,
			Set.of(WAITING_FOR_TESTING, TESTING, WAITING_FOR_DEPLOYMENT, DONE), WAITING_FOR_TESTING,
			Set.of(TESTING, WAITING_FOR_DEPLOYMENT, DONE), TESTING, Set.of(WAITING_FOR_DEPLOYMENT, DONE),
			WAITING_FOR_DEPLOYMENT, Set.of(DONE));

}
