import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { Plus, GripVertical, Calendar, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';

export const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState({
    TODO: [],
    IN_PROGRESS: [],
    DONE: []
  });
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const pRes = await fetch(`/api/projects/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const tRes = await fetch(`/api/tasks/project/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const uRes = await fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (pRes.ok) setProject(await pRes.json());
      if (tRes.ok) {
        const tasks = await tRes.json();
        setColumns({
          TODO: tasks.filter(t => t.status === 'TODO'),
          IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
          DONE: tasks.filter(t => t.status === 'DONE')
        });
      }
      if (uRes.ok) {
        setUsers(await uRes.json());
      }
    } catch (err) {
      toast.error('Failed to fetch project data');
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/project/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newTask)
      });
      if (!res.ok) throw new Error('Failed to create task');
      toast.success('Task created');
      setShowModal(false);
      setNewTask({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
      fetchProjectData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (user.role !== 'ADMIN' && source.droppableId !== destination.droppableId) {
      // Member can move tasks around
    }

    const sourceCol = [...columns[source.droppableId]];
    const destCol = [...columns[destination.droppableId]];
    const [movedTask] = sourceCol.splice(source.index, 1);
    
    // Optimistic UI update
    movedTask.status = destination.droppableId;
    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, movedTask);
      setColumns({ ...columns, [source.droppableId]: sourceCol });
    } else {
      destCol.splice(destination.index, 0, movedTask);
      setColumns({
        ...columns,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol
      });
    }

    // Backend update
    if (source.droppableId !== destination.droppableId) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/tasks/${draggableId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status: destination.droppableId })
        });
        if (!res.ok) throw new Error('Failed to update task status');
      } catch (err) {
        toast.error('Failed to sync with server. Reverting...');
        fetchProjectData(); // Revert on failure
      }
    }
  };

  if (!project) return (
    <div className="container page-wrapper flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, border: '4px solid var(--border-strong)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <motion.div className="container page-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-gradient">{project.name}</h1>
          <p className="text-muted mt-2">{project.description}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {Object.entries(columns).map(([columnId, columnTasks]) => (
            <div key={columnId} className="kanban-column" style={{ borderRadius: '1rem', border: '1px solid var(--border-subtle)', background: 'rgba(26, 26, 38, 0.6)' }}>
              <div className="kanban-header">
                <h3 className="flex items-center gap-2" style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
                  {columnId === 'TODO' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#94a3b8' }} />}
                  {columnId === 'IN_PROGRESS' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />}
                  {columnId === 'DONE' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />}
                  {columnId.replace('_', ' ')}
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', marginLeft: 'auto' }}>{columnTasks.length}</span>
                </h3>
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div 
                    className="kanban-body" 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    style={{ background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s ease' }}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-card"
                            style={{
                              ...provided.draggableProps.style,
                              boxShadow: snapshot.isDragging ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                              borderColor: snapshot.isDragging ? 'var(--brand-primary)' : 'var(--border-subtle)',
                              background: snapshot.isDragging ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                            }}
                          >
                            <h4 style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                              {task.title}
                              <GripVertical size={16} className="text-muted" style={{ cursor: 'grab' }} />
                            </h4>
                            <p className="text-sm text-muted mb-4">{task.description}</p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted">
                                  <Calendar size={12} />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                              {task.assigneeId && (
                                <img 
                                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigneeId.name)}&background=random&color=fff&rounded=true&size=24`} 
                                  alt="Assignee" 
                                  title={task.assigneeId.name}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <motion.div 
              className="glass-panel" 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}
            >
              <h2 className="mb-6">Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input type="text" required className="form-input" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows="3"></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date (Optional)</label>
                  <input type="date" className="form-input" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To (Optional)</label>
                  <select className="form-input" value={newTask.assigneeId} onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
