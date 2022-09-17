import {lerp} from "/js/util"

export class Road {
    constructor(x, width, laneCount = 3) {
        this.x = x
        this.width = width
        this.laneCount = laneCount
        this.left = this.x - this.width / 2
        this.right = this.x + this.width / 2
        this.top = -1_000_000
        this.bottom = 1_000_000
        this.borders = [
            [
                {x: this.left, y: this.top},
                {x: this.left, y: this.bottom},
            ],
            [
                {x: this.right, y: this.top},
                {x: this.right, y: this.bottom},
            ],
        ]
    }

    draw(ctx) {
        ctx.lineWidth = 5
        ctx.strokeStyle = "white"

        ctx.setLineDash([20, 20])

        for (let i = 1; i < this.laneCount; i++) {
            const x = lerp(this.left, this.right, i / this.laneCount)

            ctx.beginPath()
            ctx.moveTo(x, this.top)
            ctx.lineTo(x, this.bottom)
            ctx.stroke()
        }

        ctx.setLineDash([])

        for (const [a, b] of this.borders) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
        }
    }

    getLaneCenter(laneIndex) {
        const laneWidth = this.width / this.laneCount

        return (
            this.left +
            laneWidth / 2 +
            laneWidth * Math.min(laneIndex, this.laneCount - 1)
        )
    }
}
