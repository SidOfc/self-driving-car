export class Controls {
    #actions

    constructor(controlType) {
        this.#actions = {
            ArrowUp: "forward",
            ArrowDown: "reverse",
            ArrowLeft: "left",
            ArrowRight: "right",
        }

        switch (controlType) {
            case "KEYS":
                this.#attach()
                break
            case "DUMMY":
                this.forward = true
                break
        }
    }

    keydown = ({key}) => {
        const property = this.#actions[key]

        if (property) this[property] = true
    }

    keyup = ({key}) => {
        const property = this.#actions[key]

        if (property) this[property] = false
    }

    #attach() {
        document.addEventListener("keydown", this.keydown)
        document.addEventListener("keyup", this.keyup)
    }

    #detach() {
        document.removeEventListener("keydown", this.keydown)
        document.removeEventListener("keyup", this.keyup)
    }
}
