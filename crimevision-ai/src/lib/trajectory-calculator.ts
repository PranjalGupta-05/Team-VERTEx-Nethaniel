// Ballistic Trajectory Mathematics Utility for 3D Crime Scene Reconstruction

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface TrajectoryData {
  shooterPosition: Vector3D;
  impactPosition: Vector3D;
  distanceMeters: number;
  pitchDegrees: number; // Vertical angle (elevation/depression)
  yawDegrees: number;   // Horizontal angle (azimuth)
  estimatedShooterHeight: number;
  bulletVelocityMps: number;
}

/**
 * Calculates 3D distance, pitch, yaw, and estimated shooter parameters
 */
export function calculateTrajectory(
  shooter: Vector3D,
  impact: Vector3D,
  bulletVelocityMps: number = 380 // 9mm standard velocity
): TrajectoryData {
  const dx = impact.x - shooter.x;
  const dy = impact.y - shooter.y;
  const dz = impact.z - shooter.z;

  const distanceMeters = Math.hypot(dx, dy, dz);
  const horizontalDistance = Math.hypot(dx, dz);

  // Pitch (elevation angle from shooter to impact)
  const pitchRad = Math.atan2(dy, horizontalDistance);
  const pitchDegrees = (pitchRad * 180) / Math.PI;

  // Yaw (azimuth direction)
  const yawRad = Math.atan2(dx, dz);
  const yawDegrees = (yawRad * 180) / Math.PI;

  return {
    shooterPosition: shooter,
    impactPosition: impact,
    distanceMeters: Number(distanceMeters.toFixed(2)),
    pitchDegrees: Number(pitchDegrees.toFixed(1)),
    yawDegrees: Number(yawDegrees.toFixed(1)),
    estimatedShooterHeight: Number((shooter.y * 1.75).toFixed(2)), // Approx height baseline
    bulletVelocityMps,
  };
}
