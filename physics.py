import math

def simulate_trajectory(angle, speed, mass, diameter, height, wind_speed, wind_angle):
    g = 9.81
    dt = 0.1
    x = 0
    y = height
    vx = speed * math.cos(math.radians(angle))
    vy = speed * math.sin(math.radians(angle))

    trajectory = []
    t = 0

    while y >= 0 and t < 300:
        trajectory.append({'x': x, 'y': y, 't': t})
        speed_total = math.sqrt(vx**2 + vy**2)
        drag_coeff = 0.47
        area = math.pi * (diameter/2)**2
        drag = 0.5 * 1.225 * speed_total**2 * drag_coeff * area / mass
        ax = -drag * vx / speed_total
        ay = -g - drag * vy / speed_total
        vx += ax * dt
        vy += ay * dt
        x += vx * dt
        y += vy * dt
        t += dt

    metrics = {
        'max_range': max([p['x'] for p in trajectory]),
        'max_height': max([p['y'] for p in trajectory]),
        'impact_range': trajectory[-1]['x'],
        'total_flight_time': trajectory[-1]['t'],
        'impact_speed': math.sqrt(vx**2 + vy**2)
    }

    return {'trajectory': {'x':[p['x'] for p in trajectory], 'y':[p['y'] for p in trajectory], 'time':[p['t'] for p in trajectory]}, 'metrics': metrics}
