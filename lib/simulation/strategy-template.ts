import type { LevelConfig, StrategyLapAction, StrategyPlan, StrategySegmentAction, TrackSegment } from "@/lib/types/racing";

const targetSpeedForStraight = (level: LevelConfig): number => Math.max(5, Math.min(level.car["max_speed_m/s"], Math.round(level.car["max_speed_m/s"] * 0.75)));

const brakeStartForStraight = (segmentLength: number): number => Math.max(1, Math.round(segmentLength * 0.4));

const toSegmentAction = (segment: TrackSegment, level: LevelConfig): StrategySegmentAction => {
	if (segment.type === "corner") {
		return {
			id: segment.id,
			type: "corner",
		};
	}

	return {
		id: segment.id,
		type: "straight",
		"target_m/s": targetSpeedForStraight(level),
		brake_start_m_before_next: brakeStartForStraight(segment["length_m"]),
	};
};

const buildLap = (lap: number, level: LevelConfig): StrategyLapAction => ({
	lap,
	segments: level.track.segments.map((segment) => toSegmentAction(segment, level)),
	pit: {
		enter: false,
	},
});

export const buildStarterStrategy = (level: LevelConfig): StrategyPlan => {
	const initialSet = level.tyres.available_sets.at(0);
	const initialTyreId = initialSet?.ids.at(0);

	if (!initialTyreId) {
		throw new Error("Cannot generate strategy: no available tyre ids found.");
	}

	return {
		initial_tyre_id: initialTyreId,
		laps: Array.from({ length: level.race.laps }, (_, index) => buildLap(index + 1, level)),
	};
};
