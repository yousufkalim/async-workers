// A configuration object to control the concurrency level.
const config = {
  concurrenyLevel: 4,
};

// Worker Statuses
class WorkerStatuses {
  static IDLE = 'IDLE';
  static BUSY = 'BUSY';
}

// Task Statuses
class TaskStatuses {
  static NOT_STARTED = 'NOT_STARTED';
  static STARTED = 'STARTED';
  static COMPLETED = 'COMPLETED';
}

// taskNames array. This can be generated on the runtime as well. But for demonstration purposes we are hardcoding it here.
// But you may add as many tasks you want.
const taskNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const taskObjs = [];

// Workers acts as Node.js runtime threads. Not real CPU level thread, as the whole environment of Node.js is single-threaded in itself.
// They act as executors with statuses i.e. busy or idle. So that we know if all our workers are busy then,
// we are bottlenecked. We can't do more work.
class Worker {
  index;
  status = WorkerStatuses.IDLE; // When a worker is spawned, then it is idle.

  constructor(index) {
    this.index = index;
  }

  async do(fcn) {
    // Before doing the work, worker will mark itself as busy.
    this.status = WorkerStatuses.BUSY;
    // Do work.
    await fcn();
    // After doing the work, worker will mark itself as idle again.
    this.status = WorkerStatuses.IDLE;
  }
}

// A mockup task simulator. This will take a task and complete it after a random time between 0-200ms.
function taskRunner(task) {
  task.status = TaskStatuses.STARTED;
  console.log(`taskRunner: Task ${task.name} started.`);
  const startTime = Date.now();
  return new Promise((res, rej) => {
    const resolveTime = Math.random() * 200; // 0-200ms
    setTimeout(() => {
      const endTime = Date.now();
      task.status = TaskStatuses.COMPLETED;
      console.log(`taskRunner: Task ${task.name} finished in ${endTime - startTime} ms`);
      res(true);
    }, resolveTime);
  });
}

// Top level self-executing async function to run everything.
(async () => {
  // Program start time.
  const exeStartTime = Date.now();

  // Populate taskObjs.
  for (let i = 0; i < taskNames.length; i++) {
    const task = taskNames[i];
    const obj = {
      name: task,
      status: TaskStatuses.NOT_STARTED,
    };
    taskObjs.push(obj);
  }

  // Spawn Workers
  const workers = [];
  for (let i = 0; i < config.concurrenyLevel; i++) {
    const worker = new Worker(i);
    workers.push(worker);
  }

  // This acts as an infinite event loop which runs every 1 millisecond i.e. its resolution.
  // It checks for 2 things. If we have any idle worker and there are uncompleted tasks then those
  // workers are allocated those tasks. It keeps running unless all the tasks have been completed.
  // Once all the tasks are completed the script exits and prints the system metrices.
  setInterval(() => {
    if (taskObjs.filter((_) => _.status == TaskStatuses.COMPLETED).length == taskNames.length) {
      const exeEndTime = Date.now();
      console.log('*** ALL TASKS COMPLETED ***');
      console.log(`*** Total Tasks: ${taskNames.length} ***`);
      console.log(`*** Concurrency Level: ${config.concurrenyLevel} ***`);
      console.log(`*** Program Execution Time: ${exeEndTime - exeStartTime} ms ***`);
      console.log(`*** Avg Program Execution Time Per Task: ${(exeEndTime - exeStartTime) / taskNames.length} ms ***`);
      process.exit(0);
    }
    for (let i = 0; i < workers.length; i++) {
      const worker = workers[i];
      const task = taskObjs.filter((_) => _.status == TaskStatuses.NOT_STARTED)[0];
      if (worker.status == WorkerStatuses.IDLE && task) {
        worker.do(() => taskRunner(task));
      }
    }
  }, 1);
})();
