import {Controls} from "/js/controls"
import {Sensor} from "/js/sensor"
import {NeuralNetwork} from "/js/network"
import {polysIntersect} from "/js/util"

export class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 3) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.damaged = false

        this.angle = 0
        this.speed = 0
        this.maxSpeed = maxSpeed
        this.friction = 0.05
        this.acceleration = 0.2

        this.useBrain = controlType === "AI"

        if (controlType !== "DUMMY") {
            this.sensor = new Sensor(this)
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4])
        }

        this.controls = new Controls(controlType)
        this.polygon = this.#createPolygon()
    }

    update(road, traffic) {
        if (!this.damaged) {
            this.#move()

            this.polygon = this.#createPolygon()
            this.damaged = this.#assessDamage(road, traffic)
        }

        if (this.sensor) {
            this.sensor.update(road, traffic)

            if (this.useBrain) {
                const offsets = this.sensor.readings.map((reading) =>
                    reading ? 1 - reading.offset : 0
                )

                const [forward, left, right, reverse] =
                    NeuralNetwork.feedForward(offsets, this.brain)

                Object.assign(this.controls, {forward, left, right, reverse})
            }
        }
    }

    draw(ctx, color = "black", drawSensor = false) {
        ctx.fillStyle = this.damaged ? "red" : color

        const [startPoint, ...restPoints] = this.polygon

        ctx.beginPath()

        ctx.moveTo(startPoint.x, startPoint.y)

        for (const point of restPoints) {
            ctx.lineTo(point.x, point.y)
        }

        ctx.fill()

        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx)
        }
    }

    #assessDamage(road, traffic) {
        for (const border of road.borders) {
            if (polysIntersect(this.polygon, border)) return true
        }

        for (const trafficCar of traffic) {
            if (polysIntersect(this.polygon, trafficCar.polygon)) return true
        }
    }

    #createPolygon() {
        const rad = Math.hypot(this.width, this.height) / 2
        const alpha = Math.atan2(this.width, this.height)

        return [
            {
                x: this.x - Math.sin(this.angle - alpha) * rad,
                y: this.y - Math.cos(this.angle - alpha) * rad,
            },
            {
                x: this.x - Math.sin(this.angle + alpha) * rad,
                y: this.y - Math.cos(this.angle + alpha) * rad,
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
            },
        ]
    }

    #move() {
        if (this.controls.forward) this.speed += this.acceleration
        if (this.controls.reverse) this.speed -= this.acceleration

        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2

        if (this.speed > 0) this.speed -= this.friction
        if (this.speed < 0) this.speed += this.friction
        if (Math.abs(this.speed) < this.friction) this.speed = 0

        if (this.speed !== 0) {
            const flip = this.speed > 0 ? 1 : -1

            if (this.controls.left) this.angle += 0.03 * flip
            if (this.controls.right) this.angle -= 0.03 * flip
        }

        this.x -= Math.sin(this.angle) * this.speed
        this.y -= Math.cos(this.angle) * this.speed
    }
}
