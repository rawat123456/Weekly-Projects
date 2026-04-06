const inputField = document.getElementById('inp');
const addButton = document.getElementById('add');
const taskArea = document.querySelector('.result');
const revArea = document.getElementById('revise');
const btnRev = document.getElementById('revBtn');
const Emergency = document.getElementById('UrBtn');

let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

// ================= ADD TASK =================
function pushTask(inputTaken){
    taskList.push({
        name: inputTaken,
        lastStudied: null,
        urgency: null
    });
}

function addTasks(){
    const inputTaken = inputField.value.trim();
    if(inputTaken === "") return;

    pushTask(inputTaken);

    localStorage.setItem("tasks", JSON.stringify(taskList));

    inputField.value = "";

    showTasks();
}

addButton.addEventListener("click", addTasks);


// ================= SHOW TASKS =================
function showTasks(){
    taskArea.innerHTML = "";

    taskList.forEach((item, index) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');

        li.innerHTML = `
            ${item.name} 
            ${item.lastStudied ? "(Last: " + item.lastStudied.split("T")[0] + ")" : ""}
        `;

        btn.innerText = "Done";

        btn.addEventListener('click', () => {
            taskList[index].lastStudied = new Date().toISOString();

            localStorage.setItem("tasks", JSON.stringify(taskList));

            showTasks();

            pushReviseTasks();
            Priority();
        });

        li.appendChild(btn);
        taskArea.appendChild(li);
    });
}


let revisonStack = [];

function pushReviseTasks(){
    const topics = localStorage.getItem("tasks");
    const List = JSON.parse(topics) || [];

    revisonStack = [];

    List.forEach((item) => {
        revisonStack.push(item);
    });
}


let UpdatedList = [];

function Priority(){
    const todayDate = new Date();

    const imp = 10;
    const vimp = 20;
    const quick = 30;

    UpdatedList = [];

    revisonStack.forEach((item) => {

        if(item.lastStudied === null){
            UpdatedList.push({
                name: item.name,
                priority: Infinity,
                urgency: quick
            });
        }
        else {
            const lastDate = new Date(item.lastStudied);

            const diffTime = todayDate - lastDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if(diffDays >= 2){
                UpdatedList.push({
                    name: item.name,
                    priority: diffDays,
                    urgency: imp
                });
            }
            else{
                UpdatedList.push({
                    name: item.name,
                    priority: diffDays,
                    urgency: vimp
                });
            }
        }
    });

    UpdatedList.sort((a,b) => b.priority - a.priority);
}




function ReviseTopics(){
    pushReviseTasks();
    Priority();

    revArea.innerHTML = "";

    if(UpdatedList.length === 0){
        revArea.innerHTML = "No Topic to revise ✅";
        return;
    }

    UpdatedList.forEach((item, index)=>{
        const li = document.createElement('li');

        li.innerHTML = `Revision ${index + 1}: ${item.name} → urgency ${item.urgency}`;

        revArea.appendChild(li);
    });
}




function ShowUrgentReviseTopics(){

    pushReviseTasks();
    Priority();

    revArea.innerHTML = "";

    if(UpdatedList.length === 0){
        revArea.innerHTML = "No topics need revision ✅";
        return;
    }

    let maxUrgency = 0;

    // find highest urgency
    UpdatedList.forEach((item) => {
        if(item.urgency > maxUrgency){
            maxUrgency = item.urgency;
        }
    });

    let found = false;

    UpdatedList.forEach((item) => {
        if(item.urgency === maxUrgency){
            const li = document.createElement('li');

            li.innerHTML = `🔥 Urgent: ${item.name}`;

            revArea.appendChild(li);
            found = true;
        }
    });

    if(!found){
        revArea.innerHTML = "No urgent task to show";
    }
}


// ================= EVENTS =================

btnRev.addEventListener('click', ReviseTopics);
Emergency.addEventListener('click', ShowUrgentReviseTopics);


// ================= INITIAL LOAD =================

showTasks();
ShowUrgentReviseTopics();