
function simulateTrajectory(params) {
    const g = 9.81; // gravity
    const dt = 0.1; // timestep

    let x = 0;
    let y = params.height || 0;

    let vx = params.speed * Math.cos(params.angle * Math.PI / 180);
    let vy = params.speed * Math.sin(params.angle * Math.PI / 180);

    const trajectory = [];
    let t = 0;

    while (y >= 0 && t < 300) {
        trajectory.push({ x, y, t });

        const speedTotal = Math.sqrt(vx * vx + vy * vy);
        const dragCoeff = 0.47;
        const area = Math.PI * (params.diameter / 2) ** 2;
        const drag = 0.5 * 1.225 * speedTotal * speedTotal * dragCoeff * area / params.mass;

        const ax = -drag * (vx / (speedTotal || 1));
        const ay = -g - drag * (vy / (speedTotal || 1));

        vx += ax * dt;
        vy += ay * dt;

        x += vx * dt;
        y += vy * dt;
        t += dt;
    }

    if (trajectory.length === 0) trajectory.push({ x: 0, y: params.height || 0, t: 0 });

    const xArr = trajectory.map(p => p.x);
    const yArr = trajectory.map(p => p.y);
    const tArr = trajectory.map(p => p.t);

    return {
        trajectory: { x: xArr, y: yArr, time: tArr },
        metrics: {
            max_range: Math.max(...xArr),
            max_height: Math.max(...yArr),
            impact_range: xArr[xArr.length - 1],
            total_flight_time: tArr[tArr.length - 1],
            impact_speed: Math.sqrt(vx * vx + vy * vy)
        }
    };
}
