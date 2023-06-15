'use strict';

class Jumper  {
    constructor() {
        this.fast = document.querySelector(`input[name="fast"]`);
        this.prof = document.querySelector(`input[name='proficient']`);
        this.cheap = document.querySelector(`input[name="cheap"]`);
        this.buttons = document.querySelectorAll(`input[type="checkbox"]`);
        this.last_changed = null;
        // console.log(this.buttons);
        this.state = "init"
        this.dispatch('to_input');
    }

    dispatch(action_name, ...args) {
        const actions = this.transitions[this.state];
        if (action_name in actions) {
            const action = actions[action_name];
            action.call(this, args);
        }
        else {
            console.warn(`no route "${action_name}" from "${this.state}"`);
        }
    }

    change_state(new_state) {
        if (this.state === new_state) {
            console.warn(`restricted change state "${this.state}" => "${new_state}"`);
            return;
        }
        if (new_state in this.transitions) {
            this.dispatch('leave');
            this.state = new_state;
            this.dispatch('init');
        }
        else {
            console.error(`no such state "${new_state}"`);
        }
    }

    input_change(event) {
        // console.log(event.target.name);
        this.last_changed = event.target.name;
        this.dispatch('to_calc');
    }

    randrange(a, b) {
        if (a > b) {
            [a, b] = [b, a]
        }
        a = a - 0.5;
        b = b + 0.5;
        return Math.round(Math.random()*(b-a) + a);
    }

    transitions = {
        "init": {
            leave(){},
            to_input() {
                this.buttons.forEach(element => {
                    element.addEventListener(
                        'change', 
                        event => {
                            this.input_change.call(this, event);
                        }, 
                        {'once': false}
                    )
                });

                this.change_state('input');
            },
        },
        "input": {
            init() {},
            leave() {},
            to_calc() {
                this.change_state("calc");
            },
        },
        "calc": {
            init() {
                const values = [
                    this.fast.checked,
                    this.prof.checked,
                    this.cheap.checked,
                ];
                // console.log(values);
                let sum = values.filter(el => el).length;
                if (sum < 3) {
                    this.change_state('input');
                }
                else {
                    this.change_state('too_many');
                }
            },
            leave() {},
        },
        "too_many": {
            init() {
                // console.log(this.last_changed);
                const values = [];
                this.buttons.forEach(el => values.push(el.name));
                // console.log(values);
                let rand_index = this.randrange(0, values.length - 1);
                while (values[rand_index] === this.last_changed) {
                    rand_index = this.randrange(0, values.length - 1);
                }
                const elem = document.querySelector(`input[name="${values[rand_index]}"]`);
                elem.checked = false;

                this.dispatch('to_input');
            },
            leave() {},
            to_input() {
                this.change_state('input');
            },
        },
        "send": {
            init() {},
            leave() {},
        },
    };
}

const j = new Jumper();

