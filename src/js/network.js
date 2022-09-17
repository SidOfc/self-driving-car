import {lerp} from "/js/util"

export class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = new Array(neuronCounts)

        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels[i] = new Level(neuronCounts[i], neuronCounts[i + 1])
        }
    }

    static feedForward(givenInputs, network) {
        let outputs = Level.feedForward(givenInputs, network.levels[0])

        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i])
        }

        return outputs
    }

    static mutate(network, amount = 1) {
        network.levels.forEach((level) => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                )
            }

            level.weights.forEach((weights) => {
                for (let i = 0; i < weights.length; i++) {
                    weights[i] = lerp(weights[i], Math.random() * 2 - 1, amount)
                }
            })
        })

        return network
    }
}

export class Level {
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount).fill(0)
        this.outputs = new Array(outputCount).fill(0)
        this.biases = new Array(inputCount).fill(0)
        this.weights = this.inputs.map(() => new Array(outputCount).fill(0))

        Level.#randomize(this)
    }

    static feedForward(givenInputs, level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i] ?? 0
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0

            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i]
            }

            level.outputs[i] = sum > level.biases[i] ? 1 : 0
        }

        return level.outputs
    }

    static #randomize(level) {
        level.weights.forEach((weights) => {
            for (let i = 0; i < weights.length; i++) {
                weights[i] = Math.random() * 2 - 1
            }
        })

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1
        }
    }
}
