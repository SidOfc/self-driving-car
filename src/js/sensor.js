import {lerp, getIntersection} from "/js/util"

export class Sensor {
    constructor(car) {
        this.car = car
        this.rays = []
        this.readings = []
        this.rayCount = 5
        this.rayLength = 150
        this.raySpread = Math.PI / 2
    }

    update(road, traffic) {
        this.#cast()
        this.readings = this.rays.map((ray) =>
            this.#getReading(ray, road, traffic)
        )
    }

    draw(ctx) {
        ctx.lineWidth = 2

        this.rays.forEach(([a, b], i) => {
            const end = this.readings[i] ?? b

            ctx.strokeStyle = "yellow"

            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()

            if (end !== b) {
                ctx.strokeStyle = "black"

                ctx.beginPath()
                ctx.moveTo(end.x, end.y)
                ctx.lineTo(b.x, b.y)
                ctx.stroke()
            }
        })
    }

    #getReading(ray, road, traffic) {
        const touches = road.borders.reduce((acc, border) => {
            const touch = getIntersection(...ray, ...border)

            if (touch) acc.push(touch)

            return acc
        }, [])

        traffic.reduce((acc, {polygon}) => {
            for (let i = 0; i < polygon.length; i++) {
                const touch = getIntersection(
                    ...ray,
                    polygon[i],
                    polygon[(i + 1) % polygon.length]
                )

                if (touch) acc.push(touch)
            }

            return acc
        }, touches)

        if (touches.length > 0) {
            const minOffset = Math.min(...touches.map(({offset}) => offset))

            return touches.find((touch) => touch.offset === minOffset)
        }
    }

    #cast() {
        const {x, y, angle} = this.car

        this.rays = []

        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle =
                angle +
                lerp(
                    this.raySpread / 2,
                    -this.raySpread / 2,
                    this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
                )

            this.rays.push([
                {x, y},
                {
                    x: x - Math.sin(rayAngle) * this.rayLength,
                    y: y - Math.cos(rayAngle) * this.rayLength,
                },
            ])
        }
    }
}
