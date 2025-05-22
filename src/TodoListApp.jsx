import React, { useState, useEffect } from 'react';

const FILTER_MAP = {
  All: () => true,
  Active: task => !task.completed,
  Completed: task => task.completed,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

function formatDate(dateStr) {
  if (!dateStr) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString(undefined, options);
}

export default function TodoListApp() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks')) || []);
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('');
  const [filter, setFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const todayISO = new Date().toISOString().split('T')[0];

  function isPastDate(dateStr) {
    if (!dateStr) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr + 'T00:00:00');
    return date < today;
  }

  function addTask() {
    if (!newTask.trim()) return alert('Task cannot be empty.');
    if (!newDate) return alert('Please select a due date.');
    if (isPastDate(newDate)) return alert('Due date cannot be in the past.');

    setTasks([...tasks, { id: Date.now().toString(), text: newTask.trim(), completed: false, dueDate: newDate }]);
    setNewTask('');
    setNewDate('');
  }

  function toggleCompleted(id) {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }

  function deleteTask(id) {
    setTasks(tasks.filter(task => task.id !== id));
  }

  function startEditing(id, currentText, currentDate) {
    setEditingId(id);
    setEditText(currentText);
    setEditDate(currentDate);
  }

  function saveEdit(id) {
    if (!editText.trim()) return alert('Task cannot be empty.');
    if (!editDate) return alert('Please select a due date.');
    if (isPastDate(editDate)) return alert('Due date cannot be in the past.');

    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: editText.trim(), dueDate: editDate } : task
    ));
    setEditingId(null);
    setEditText('');
    setEditDate('');
  }

  function clearCompleted() {
    setTasks(tasks.filter(task => !task.completed));
  }

  // Filtered tasks
  const filteredTasks = tasks.filter(FILTER_MAP[filter]);

  // Due date style helper
  function dueDateClass(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dueDate + 'T00:00:00');

    if (date < today) return 'due-overdue';
    if (date.getTime() === today.getTime()) return 'due-today';
    return 'due-normal';
  }

  return (
    <section className="todo-section">
      <h2 className="title">To-Do List</h2>

      <div className="input-group">
        <input
          type="text"
          placeholder="Add new task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          className="input-task"
          aria-label="Task name"
        />
        <input
          type="date"
          value={newDate}
          min={todayISO}
          onChange={e => setNewDate(e.target.value)}
          className="input-date"
          aria-label="Due date"
        />
        <button onClick={addTask} className="btn-add" aria-label="Add task">➕</button>
      </div>

      <div className="filter-group" role="group" aria-label="Filter tasks">
        {FILTER_NAMES.map(name => (
          <button
            key={name}
            className={`btn-filter ${filter === name ? 'active' : ''}`}
            onClick={() => setFilter(name)}
            aria-pressed={filter === name}
          >
            {name}
          </button>
        ))}
      </div>

      <ul className="task-list">
        {filteredTasks.length === 0 && <li className="no-tasks">No tasks here.</li>}

        {filteredTasks.map(task => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleCompleted(task.id)}
              className="task-checkbox"
              aria-label={`Mark task "${task.text}" as completed`}
            />

            {editingId === task.id ? (
              <>
                <input
                  className="edit-input"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)}
                  placeholder="Task name"
                />
                <input
                  type="date"
                  className="edit-date"
                  value={editDate}
                  min={todayISO}
                  onChange={e => setEditDate(e.target.value)}
                  aria-label="Edit due date"
                />
                <button onClick={() => saveEdit(task.id)} className="btn-save" aria-label="Save edit">💾</button>
                <button onClick={() => setEditingId(null)} className="btn-cancel" aria-label="Cancel edit">✖️</button>
              </>
            ) : (
              <>
                <span
                  className="task-text"
                  onDoubleClick={() => startEditing(task.id, task.text, task.dueDate)}
                  title="Double click to edit"
                >
                  {task.text}
                </span>
                <span className={`due-date ${dueDateClass(task.dueDate)}`} title={`Due: ${formatDate(task.dueDate)}`}>
                  {formatDate(task.dueDate)}
                </span>
                <button onClick={() => startEditing(task.id, task.text, task.dueDate)} className="btn-edit" aria-label="Edit task">
                  ✏️
                </button>
                <button onClick={() => deleteTask(task.id)} className="btn-delete" aria-label="Delete task">
                  🗑️
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="footer-actions">
        <span>{tasks.filter(task => !task.completed).length} task(s) left</span>
        <button onClick={clearCompleted} className="btn-clear" aria-label="Clear completed tasks">Clear Completed</button>
      </div>
    </section>
  );
}
