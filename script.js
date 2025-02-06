document.addEventListener("DOMContentLoaded",function(){
    const inputTodo = document.getElementById('input-todo');
    const addTodoButton = document.getElementById('button-todo');
    const todoListContainer = document.getElementById('list-todo');
    const deleteAllTodo = document.getElementById('deleteAll-todo');
    const changeThemeButton = document.getElementById('changeTheme');
    const statusBox = document.querySelector('.card-text');
    const confirmDeleteButton = document.querySelector('#staticBackdrop .btn-danger');

    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    const fakeAPI = axios.create({baseURL:'https://jsonplaceholder.typicode.com'});

    let elementsToDelete = [];

    const statusBoxUpdate = (res) =>{
        const displayContent = `Status Code : ${res.status} \n ${JSON.stringify(res.data)}`;
        statusBox.textContent = displayContent;
    }

    const createTodo=(task)=>{
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-start";
        li.innerHTML = `
        <span class='text-todo'>${task}</span>
        <div class="btn-group" role="group" aria-label="Basic mixed styles example">
            <button type="button" class="btn btn-danger">✏️</button>
            <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#staticBackdrop">🗑️</button>
        </div>`;
        todoListContainer.appendChild(li);
    }

    const saveAllTodo=()=>{
        const allTodos = [...document.querySelectorAll(".text-todo")].map((task)=>task.textContent);
        localStorage.setItem("allTodos",JSON.stringify(allTodos));
    }

    const loadAllTodo=()=>{
        const allTodos = JSON.parse(localStorage.getItem('allTodos'))  || [];
        allTodos.forEach((task)=>createTodo(task));
    }
    loadAllTodo();

    const populate = ()=>{
        fakeAPI.get('/todos?_limit=7')
        .then((res) => {
            statusBoxUpdate(res);
            return (res.data)
        })
        .then(data => {
            data.forEach((task)=>{
                createTodo(task.title);
            })
            saveAllTodo();
            console.log('populated the todoList');
        });
    }

    changeThemeButton.addEventListener('click',(e)=>{
        e.preventDefault();
        document.querySelector('html').getAttribute('data-bs-theme') === 'dark' ? document.querySelector('html').setAttribute('data-bs-theme','light'): document.querySelector('html').setAttribute('data-bs-theme','dark');
    })

    addTodoButton.addEventListener('click',function(){
        const text = inputTodo.value;
        console.log('New Item stored in the fake database');

        fakeAPI.post('/todos',{
            title:text,
            completed:false
        }).then((res)=>statusBoxUpdate(res));
        
        createTodo(text)
        inputTodo.value = '';
        saveAllTodo();    
    })

    confirmDeleteButton.addEventListener('click',()=>{

        if(elementsToDelete) {
            fakeAPI.delete(`/todos/${1}`)
            .then((res)=>{
                console.log("Status",res);
                statusBoxUpdate(res);
            })
            elementsToDelete.forEach((task)=>task.remove());
        }
        elementsToDelete = [];
        saveAllTodo();
        confirmDeleteModal.hide();
    })

    deleteAllTodo.addEventListener('click',()=>{
        confirmDeleteModal.show();
        elementsToDelete = [...document.querySelectorAll('.list-group-item')];
    })

    todoListContainer.addEventListener('click',(e)=>{
        if(e.target.classList.contains('btn-warning')){
            elementsToDelete =[e.target.closest('.list-group-item')];
            confirmDeleteModal.show();
        }

        if(e.target.classList.contains('btn-danger')){
            const li = e.target.closest(".list-group-item");
            const textSpan = li.querySelector('.text-todo');
            const buttonGroup = li.querySelector('.btn-group');
            const taskText = li.querySelector('.text-todo').textContent;

            const editInput = document.createElement('input');
            const saveEdit = document.createElement('button');
            editInput.classList.add('form-control');
            editInput.value = taskText;
            saveEdit.textContent = "Save";
            saveEdit.className ='btn btn-outline-danger';

            saveEdit.addEventListener('click',()=>{
                console.log("Updated the item stored in the fake database");

                textSpan.textContent = editInput.value;
                li.replaceChild(textSpan,editInput);
                li.replaceChild(buttonGroup,saveEdit);

                fakeAPI.patch(`/todos/${1}`,{
                        title:editInput.value,
                        completed:true
                    }).then((res)=>statusBoxUpdate(res));

                saveAllTodo();
            })            

            li.replaceChild(editInput,textSpan);
            li.replaceChild(saveEdit, buttonGroup);
        }

    })

    document.getElementById('populate-todo').addEventListener('click',populate);

});
