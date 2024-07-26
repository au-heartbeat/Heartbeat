package heartbeat.service.report.calculator.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CardCountAndStoryPointsPairInClassification {

	private int cardCount;

	private double storyPoints;

	public static CardCountAndStoryPointsPairInClassification of() {
		return new CardCountAndStoryPointsPairInClassification(0, 0.0);
	}

	public void addCardCount() {
		this.cardCount = Math.max(this.cardCount, 0);
		this.cardCount += 1;
	}

	public void addStoryPoints(double storyPoints) {
		this.storyPoints = Math.max(this.storyPoints, 0);
		this.storyPoints += storyPoints;
	}

	public void reduceCardCount() {
		this.cardCount -= 1;
		this.cardCount = Math.max(this.cardCount, 0);
	}

	public void reduceStoryPoints(double storyPoints) {
		this.storyPoints -= storyPoints;
		this.storyPoints = Math.max(this.storyPoints, 0);
	}

}
