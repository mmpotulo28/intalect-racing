# Algorithms and Rules Reference

This document translates competition rules into implementation-ready guidance.

## 1. Kinematics and Segment Timing

### 1.1 Acceleration time on straights

Given initial speed v_i, final speed v_f, acceleration a:

- t = (v_f - v_i) / a

### 1.2 Distance with known initial and final speed

- d = (v_f^2 - v_i^2) / (2 \* a)

### 1.3 Distance with known time

- d = v_i _ t + 0.5 _ a \* t^2

## 2. Corner Safety Speed

Maximum allowed corner speed:

- v_corner_max = sqrt(tyre_friction _ gravity _ radius) + crawl_constant_mps

If entry speed to corner is greater than v_corner_max:

1. Apply crash time penalty.
2. Apply flat tyre degradation penalty (0.1).
3. Enter crawl mode for subsequent corners until a straight is reached.

## 3. Tyre Behavior

Tyre friction at any point:

- tyre_friction = (base_friction - total_degradation) \* weather_friction_multiplier

### 3.1 Straight degradation

- deg_straight = tyre_degradation_rate _ segment_length_m _ K_STRAIGHT

### 3.2 Braking degradation

- deg_braking = (((v_i / 100)^2 - (v_f / 100)^2) _ K_BRAKING _ tyre_degradation_rate)

### 3.3 Corner degradation

- deg_corner = K_CORNER _ (speed^2 / radius) _ tyre_degradation_rate

### 3.4 Blowout condition

If tyre life reaches zero or below during a segment:

1. Trigger limp mode.
2. Continue in limp mode until pit stop with tyre change.

## 4. Fuel Model

Fuel used over a segment:

- F_used = (K_base + K_drag _ ((v_i + v_f) / 2)^2) _ distance

Where:

- K_base = 0.0005 l/m
- K_drag = 0.0000000015 l/m

If fuel reaches zero during a segment:

1. Trigger limp mode.
2. Stay in limp mode until pit stop refuel.

Refuel time:

- refuel_time_s = refuel_amount_l / pit_refuel_rate_lps

## 5. Modes and Transitions

### 5.1 Crawl mode

Trigger:

- Corner crash from excessive corner entry speed.

Behavior:

- Travel at crawl constant speed for corners.
- Exit crawl mode once a straight is encountered where acceleration can resume.

### 5.2 Limp mode

Trigger:

- Fuel depletion OR tyre blowout.

Behavior:

- Travel at limp constant speed with no acceleration/deceleration.
- Continues across segments until pit stop fixes root cause.

## 6. Weather Timeline

1. Race starts with configured weather condition.
2. Weather conditions change by duration.
3. If race time exceeds defined sequence duration, cycle restarts from first condition.
4. Weather modifies:

- acceleration
- deceleration
- tyre friction multiplier
- tyre degradation rate

## 7. Pit Stop Timing

Pit stop total time:

- pit_time_s = refuel_time_s + tyre_swap_time_s + base_pit_stop_time_s

Constraints:

1. Pit lane entry is available only at end of lap.
2. Tyre change must reference available set ID.
3. Car exits pit at configured pit_exit_speed_mps.

## 8. Scoring Rules

### 8.1 Level 1 base score

- base_score = 500000 \* (time_reference_s / race_time_s)^3

### 8.2 Level 2 and 3 fuel bonus

- fuel_bonus = -500000 \* (1 - fuel_used / fuel_soft_cap_limit_l)^2 + 500000
- final_score = base_score + fuel_bonus

### 8.3 Level 4 tyre bonus

- tyre_bonus = 100000 _ sum_tyre_degradation - 50000 _ number_of_blowouts
- final_score = base_score + fuel_bonus + tyre_bonus

## 9. Deterministic Optimizer Notes

1. Use fixed pseudo-random seed.
2. Use stable ordering for candidate pools.
3. Break ties using deterministic secondary keys.
4. Round floating-point values with explicit policy before serialization.

## 10. Output Contract

Submission output must include:

1. initial_tyre_id
2. laps[]
3. per-segment actions for straights
4. pit decision per lap

Export must be JSON-valid and deterministic for same input + seed.
