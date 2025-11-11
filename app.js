// DOM要素の取得
const addTaskButton = document.getElementById('add-task-btn');
const taskInput = document.getElementById('new-task');
const dueDateInput = document.getElementById('due-date');
const todoList = document.getElementById('todo-list');
const filterSelect = document.getElementById('filter');
const sortToggleBtn = document.getElementById('sort-toggle-btn');

let sortAscending = true;

// ローカルストレージからタスクを取得して表示
function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = sortTasksByDueDate(tasks);
  todoList.innerHTML = '';
  tasks.forEach(task => createTaskElement(task.text, task.completed, task.dueDate));
  highlightOverdueTasks();
}

// タスクを保存
function saveTasks() {
  const tasks = [];
  const listItems = todoList.querySelectorAll('li');
  listItems.forEach(item => {
    const text = item.querySelector('.task-text').textContent;
    const completed = item.querySelector('input[type="checkbox"]').checked;
    const dueDateText = item.querySelector('.due-date')?.textContent || '';
    const dueDate = dueDateText.replace('期限: ', '');
    tasks.push({ text, completed, dueDate });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// タスクを追加
function addTask() {
  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (taskText === "") {
    alert("タスクを入力してください");
    return;
  }

  createTaskElement(taskText, false, dueDate);
  saveTasks();
  taskInput.value = '';
  dueDateInput.value = '';
  loadTasks(); // 再描画
}

// タスク要素を作成
function createTaskElement(taskText, isCompleted, dueDate) {
  const listItem = document.createElement('li');
  if (isCompleted) listItem.classList.add('completed');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = isCompleted;

  const taskLabel = document.createElement('span');
  taskLabel.textContent = taskText;
  taskLabel.classList.add('task-text');

  const dueDateLabel = document.createElement('small');
  dueDateLabel.classList.add('due-date');
  if (dueDate) dueDateLabel.textContent = `期限: ${dueDate}`;

  // 編集ボタン
  const editButton = document.createElement('button');
  editButton.textContent = '編集';
  editButton.classList.add('edit-btn');
  editButton.addEventListener('click', () => {
    const newText = prompt("タスクを編集:", taskLabel.textContent);
    const newDate = prompt("期限を編集（YYYY-MM-DD形式）:", dueDate.replace('期限: ', ''));

    if (newText !== null && newText.trim() !== "") {
      taskLabel.textContent = newText.trim();
    }
    if (newDate !== null && newDate.trim() !== "") {
      dueDateLabel.textContent = `期限: ${newDate.trim()}`;
    }

    saveTasks();
    loadTasks(); // 並び替え再適用
  });

  // 削除ボタン
  const deleteButton = document.createElement('button');
  deleteButton.textContent = "削除";
  deleteButton.classList.add('delete-btn');
  deleteButton.addEventListener('click', () => {
    todoList.removeChild(listItem);
    saveTasks();
  });

  // チェックボックス動作
  checkbox.addEventListener('change', () => {
    listItem.classList.toggle('completed', checkbox.checked);
    saveTasks();
    applyFilter();
  });

  listItem.append(checkbox, taskLabel, dueDateLabel, editButton, deleteButton);
  todoList.appendChild(listItem);
}

// 期限順ソート関数（昇順／降順切替対応）
function sortTasksByDueDate(tasks) {
  return tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    const diff = new Date(a.dueDate) - new Date(b.dueDate);
    return sortAscending ? diff : -diff;
  });
}

// 期限切れを赤く
function highlightOverdueTasks() {
  const today = new Date().toISOString().split('T')[0];
  const tasks = todoList.querySelectorAll('li');
  tasks.forEach(task => {
    const dueDateText = task.querySelector('.due-date')?.textContent;
    if (dueDateText) {
      const dateStr = dueDateText.replace('期限: ', '');
      if (dateStr < today && !task.classList.contains('completed')) {
        task.style.backgroundColor = '#ffcdd2'; // 赤
      } else {
        task.style.backgroundColor = '#ffffff';
      }
    }
  });
}

// フィルター適用
function applyFilter() {
  const filter = filterSelect.value;
  const tasks = todoList.querySelectorAll('li');
  tasks.forEach(task => {
    const completed = task.querySelector('input[type="checkbox"]').checked;
    switch (filter) {
      case 'all':
        task.style.display = '';
        break;
      case 'active':
        task.style.display = completed ? 'none' : '';
        break;
      case 'completed':
        task.style.display = completed ? '' : 'none';
        break;
    }
  });
  highlightOverdueTasks();
}

// ソート切替ボタン動作
sortToggleBtn.addEventListener('click', () => {
  sortAscending = !sortAscending;
  sortToggleBtn.textContent = sortAscending ? '昇順' : '降順';
  loadTasks();
});

// イベント登録
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});
filterSelect.addEventListener('change', applyFilter);
document.addEventListener('DOMContentLoaded', loadTasks);
