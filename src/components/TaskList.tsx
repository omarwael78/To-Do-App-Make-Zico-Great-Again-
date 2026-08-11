import TaskItem from '@/components/TaskItem';
import EmptyState from '@/components/EmptyState';
import { Task, FilterType } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (task: Task) => void;
  onUpdate: (id: string, text: string) => void;
  filter: FilterType;
  onShowAll: () => void;
}

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdate,
  filter,
  onShowAll,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState filter={filter} onShowAll={onShowAll} />;
  }

  return (
    <ul className="space-y-2.5" aria-label="Task list">
      {tasks.map((task, index) => (
        <li
          key={task.id}
          style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
          className="animate-fade-in"
        >
          <TaskItem
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </li>
      ))}
    </ul>
  );
}
