document.addEventListener("DOMContentLoaded", function () {
  const taskForm = document.getElementById("task-form");
  const pendingColumn = document.getElementById("pending-column");
  const completedColumn = document.getElementById("completed-column");
  const pastDueColumn = document.getElementById("past-due-column");

  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const taskName = document.getElementById("task-name").value;
    const taskDatetime = document.getElementById("task-datetime").value;
    const taskPerson = document.getElementById("task-person").value;

    const task = {
      id: Date.now(),
      name: taskName,
      datetime: taskDatetime,
      person: taskPerson,
      status: "pending",
    };

    addTask(task);
    saveTask(task);

    taskForm.reset();
  });

  function addTask(task) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    taskElement.setAttribute("draggable", "true");
    taskElement.dataset.id = task.id;

    if (task.status === "completed") {
      taskElement.classList.add("completed");
    } else {
      const now = new Date();
      const taskDateTime = new Date(task.datetime);
      if (now > taskDateTime) {
        task.status = "past-due";
        taskElement.classList.add("past-due");
      }
    }

    taskElement.innerHTML = `
      <p class="task-name">${task.name}</p>
          <p class="task-date">${task.datetime}</p>
               <p class="task-person">${task.person} </p>
                `;

    taskElement.addEventListener("dragstart", dragStart);
    taskElement.addEventListener("dragend", dragEnd);

    if (task.status === "completed") {
      completedColumn.appendChild(taskElement);
    } else if (task.status === "past-due") {
      pastDueColumn.appendChild(taskElement);
    } else {
      pendingColumn.appendChild(taskElement);
    }
  }

  function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(addTask);
  }

  function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.id);
    setTimeout(() => {
      e.target.classList.add("hide");
    }, 0);
  }

  function dragEnd(e) {
    e.target.classList.remove("hide");
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const taskElement = document.querySelector(`[data-id='${id}']`);
    const status = e.target.closest(".column").id.replace("-column", "");
    taskElement.classList.remove("pending", "completed", "past-due");
    if (status === "completed") {
      taskElement.classList.add("completed");
    } else if (status === "past-due") {
      taskElement.classList.add("past-due");
    }
    e.target.closest(".column").appendChild(taskElement);
    updateTaskStatus(id, status);
  }

  function updateTaskStatus(id, status) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find((task) => task.id == id);
    task.status = status;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  loadTasks();

  const columns = document.querySelectorAll(".column");
  columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);
    column.addEventListener("drop", drop);
  });
});
