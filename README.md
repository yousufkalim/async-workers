# Node.js concurrent tasks runner algorithm.

## Run it

Requires [Node.js](https://nodejs.org/) v16 or higher to run.

```sh
npm run start
```

## Components

There are 3 main components of this algorithm.

- Workers
- Tasks
- Event Loop

### Workers

Workers acts as spawnable runtime threads with statuses. They are not real threads or OS level threads as the whole ecosystem of Node.js is single-threaded. Rather they are just instances, which can be spawned on demand and told to do some work. When a worker starts a work it marks itself as busy. And when it is done doing that work, it marks itself as free/idle. This way we can keep track of all the workers. See if any of them is free and allocate it some work.

### Tasks

By default all the tasks are just named references. In javascript, we call it array of strings. But we transform those tasks into objects to store the additional information. Which primarily is the status of the task. Each task is supposed to pass through 3 statuses.

- Not started
- Started
- Completed

By default, all tasks are marked as not started. When they are allocated to a worker they are marked as started and when they are completed by the worker. The worker marks itself as idle and task as complete.

### Event Loop

Event loop is the holy grail of this algorithm. It runs itself every 1 millisecond. Which is its maximum resolution. It checks for 2 things, If we have any idle worker and there are uncompleted tasks then those workers are allocated those uncompleted tasks. It keeps running unless all the tasks have been completed. Once all the tasks are completed the script exits and prints the system metrics.
