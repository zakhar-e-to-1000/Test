"use strict"
let max_i = 0;

document.querySelector('#add_t').addEventListener('click', () => {add_div(false);})
document.querySelector('#add_b').addEventListener('click', () => {add_div(true);})
document.querySelector('#undo').addEventListener('click', undo);
document.querySelector('#redo').addEventListener('click', redo);

let section = document.querySelector('section');

let actions = [];
let a_index = -1;
load_from_json();

function undo(){
    console.log(actions, a_index);
    if(actions.length == 0 || a_index == -1){
        return
    }
    take_back(actions[a_index]);
    a_index--;
    to_json();
}

function take_back(action){
    //console.log(action==undefined);
    switch(action.type){
        case 'delete':
            let new_div = div_from_task(action['task']);
            section.appendChild(new_div);
            break;
        case 'clicked':{
            let div = document.getElementById(action.id);
            let check_box = div.querySelector('input');
            check_box.checked = !action.checked_after;
            break;
        }
        case 'retitled':{
            let div = document.getElementById(action.id);
            let label = div.querySelector('label');
            label.textContent = action.prev_text;
            break;
        }

    }
}

function redo(){
    console.log(actions, a_index);
    if(a_index==actions.length-1){
        return
    }
    a_index++;
    do_action(actions[a_index]);
    to_json();
}

function add_action(type, ref_div){
    let new_action = {'type': type}
    switch (type){
        case "delete":
            new_action.task = task_from_div(ref_div);
            break;
        case 'clicked':
            new_action.id = ref_div.id;
            new_action.checked_after = ref_div.querySelector('input').checked;
            break;
        case 'retitled':
            new_action.after_text = ref_div.querySelector('label').textContent;
            new_action.id = ref_div.id;
            new_action.prev_text = "HELLO";
            let data = window.localStorage.getItem('list');
            let help_obj = JSON.parse(data);
            let num_id = Number(ref_div.id);
            for(const task of help_obj){
                if (task.id == num_id){
                    new_action.prev_text = task.text;
                    break;
                }
            }
            break;
    }

    if(actions.length!=0){
        actions.length = a_index+1;
    }
    a_index++;
    actions.push(new_action);
    to_json();
}

function do_action(action){

    switch(action.type){
        case 'delete':
            console.log('worked');
            let ref_div = document.getElementById(action['task']['id']);
            section.removeChild(ref_div);
            break;
        case 'clicked':{
            let div = document.getElementById(action.id)
            let check_box = div.querySelector('input');
            check_box.checked = action['checked_after'];
            break;
        }
        case 'retitled':{
            let div = document.getElementById(action.id);
            let label = div.querySelector('label');
            label.textContent = action.after_text;
            break;
        }
    }
}


function load_from_json(){
    let data = window.localStorage.getItem('list');
    if (data == null){
        return
    }
    let tasks = JSON.parse(data);
    for (let task of tasks){

        let new_div = div_from_task(task);
        section.appendChild(new_div);
    }
    //console.log(max_i);
}

function add_div(does_add_to_bottom){
    max_i++;
    let new_div = div_from_task({'id':max_i, 'text': `Завдання ${max_i}`, 'completed': false});
    section.appendChild(new_div);
    if (!does_add_to_bottom){
        section.prepend(new_div);
    }
    to_json();
}

function delete_div(ref_div){
    add_action("delete", ref_div);
    section.removeChild(ref_div);
}

function to_json(){
    //console.log('hello');
    let tasks = [];
    for (let div of section.children){
        tasks.push(task_from_div(div))
    }
    //console.log(JSON.stringify(obj));
    window.localStorage.setItem('list', JSON.stringify(tasks));
}

function div_from_task(task){

    let new_div = document.createElement('div');
    if (max_i<task.id){
        max_i = task.id;
    }
    new_div.id = String(task.id);

    let n = document.createElement('input');
    n.type = 'checkbox'; n.checked = task.completed;
    n.onclick = ()=>{add_action("clicked", new_div)};

    let label = document.createElement('label');
    label.textContent = task.text;
    label.contentEditable = true;
    label.onblur = ()=>{add_action("retitled", new_div)};

    let button = document.createElement('button');
    button.textContent = 'x';
    button.addEventListener('click', () => {delete_div(new_div)});

    new_div.appendChild(n);
    new_div.appendChild(label);
    new_div.appendChild(button);
    return new_div;

}

function task_from_div(div){
    let check_box = div.children[0];
    let label = div.children[1];
    return {'id': Number(div.id), 'text': label.textContent, 'completed': check_box.checked}
}