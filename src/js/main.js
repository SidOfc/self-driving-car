import "/css/main.css"
import {Car} from "/js/car"
import {Road} from "/js/road"
import {Visualizer} from "/js/visualizer"
import {NeuralNetwork} from "/js/network"

const canvas = document.querySelector("canvas.scene")
const ctx = canvas.getContext("2d")
const networkCanvas = document.querySelector("canvas.network")
const networkCtx = networkCanvas.getContext("2d")

canvas.width = 300
canvas.height = window.innerHeight

networkCanvas.width = window.innerWidth - canvas.width - 50
networkCanvas.height = window.innerHeight

document.querySelector("button[data-save]").addEventListener("click", save)
document
    .querySelector("button[data-discard]")
    .addEventListener("click", discard)

document.addEventListener("resize", () => {
    canvas.height = window.innerHeight

    networkCanvas.width = window.innerWidth - canvas.width - 50
    networkCanvas.height = window.innerHeight
})

const road = new Road(canvas.width / 2, canvas.width * 0.93)
const cars = generateCars(200)
let savedBrain = localStorage.getItem("bestBrain")
let bestCar = cars[0]

if (savedBrain) {
    savedBrain = JSON.parse(savedBrain)
    console.log("loading", {savedBrain})
    cars.forEach(
        (car) =>
            (car.brain = NeuralNetwork.mutate(
                structuredClone(savedBrain),
                0.03
            ))
    )
    bestCar.brain = savedBrain
}

const traffic = [
    new Car(road.getLaneCenter(1), 100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -100, 30, 50, "DUMMY", 1.9),
    new Car(road.getLaneCenter(2), -100, 30, 50, "DUMMY", 2.1),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 1.9),
    new Car(road.getLaneCenter(1), -350, 30, 50, "DUMMY", 1.7),
    new Car(road.getLaneCenter(2), -290, 30, 50, "DUMMY", 2.2),
    new Car(road.getLaneCenter(1), -500, 40, 50, "DUMMY", 1.8),
    new Car(road.getLaneCenter(2), -430, 30, 60, "DUMMY", 2.4),
    new Car(road.getLaneCenter(0), -600, 30, 50, "DUMMY", 1.9),
    new Car(road.getLaneCenter(1), -600, 60, 50, "DUMMY", 2),
]

console.log({cars, road})

function generateCars(amount) {
    const cars = []

    for (let i = 0; i < amount; i++) {
        cars[i] = new Car(
            road.getLaneCenter(1),
            window.innerHeight / 2,
            30,
            50,
            "AI"
        )
    }

    return cars
}

function save() {
    console.log("saving", {bestCar})
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain))
}

function discard() {
    console.log("discarding", {savedBrain})
    localStorage.removeItem("bestBrain")
}

function render(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height)

    traffic.forEach((trafficCar) => trafficCar.update(road, []))
    cars.forEach((aiCar) => aiCar.update(road, traffic))

    const yMin = Math.min(...cars.map(({y}) => y))

    bestCar = cars.find((car) => car.y === yMin)

    ctx.save()
    ctx.translate(0, -bestCar.y + canvas.height * 0.7)

    road.draw(ctx)

    traffic.forEach((trafficCar) => trafficCar.draw(ctx, "red"))
    ctx.globalAlpha = 0.2
    cars.forEach((aiCar) => aiCar.draw(ctx, "blue"))
    ctx.globalAlpha = 1

    bestCar.draw(ctx, "blue", true)

    ctx.restore()

    networkCtx.lineDashOffset = -time / 50

    Visualizer.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(render)
}

render()

console.log(canvas)
