'use client';
import { useState } from 'react';
import { WebinarTask } from '@/lib/types';
import { saveWebinar, getWebinar } from '@/lib/storage';

type TaskCardProps = {
  task: WebinarTask;
  webinarId: string;
  onUpdate: (task: WebinarTask) => void;
};

const phaseLabels: Record<string, string> = {
  setup: '開催準備',
  threeDaysBefore: '3日前',
  oneDayBefore: '前日',
  dayOf: '当日',
  after: '開催後',
};

const phaseBadgeClasses: Record<string, string> = {
  setup: 'bg-blue-100 text-blue-800',
  threeDaysBefore: 'bg-amber-100 text-amber-800',
  oneDayBefore: 'bg-orange-100 text-orange-800',
  dayOf: 'bg-red-100 text-red-800',
  after: 'bg-purple-100 text-purple-800',
};

const priorityBorderClasses: Record<string, string> = {
  high: 'border-l-4 border-l-red-400',
  medium: 'border-l-4 border-l-amber-400',
  low: 'border-l-4 border-l-gray-300',
};

const priorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const priorityTextClasses: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-gray-400',
};

export default function TaskCard({ task, webinarId, onUpdate }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(task.fieldValues || {});

  const handleComplete = () => {
    const updatedTask = {
      ...task,
      fieldValues,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    };
    onUpdate(updatedTask);
  };

  const handleFieldChange = (key: string, value: string) => {
    const newValues = { ...fieldValues, [key]: value };
    setFieldValues(newValues);

    // Also update the parent webinar's URL fields
    const webinar = getWebinar(webinarId);
    if (webinar) {
      const webinarUpdate: Record<string, string> = {};
      // Map task field keys to webinar fields
      const fieldMapping: Record<string, string> = {
        zoomUrl: 'zoomUrl',
        zoomMeetingId: 'zoomMeetingId',
        zoomPasscode: 'zoomPasscode',
        zoomAdminUrl: 'zoomAdminUrl',
        formUrl: 'formUrl',
        formEditUrl: 'formEditUrl',
        responseSheetUrl: 'responseSheetUrl',
        lpUrl: 'lpUrl',
        lpEditUrl: 'lpEditUrl',
        youtubeUrl: 'youtubeUrl',
        youtubeStudioUrl: 'youtubeStudioUrl',
        thumbnailUrl: 'thumbnailUrl',
        figmaUrl: 'figmaUrl',
      };
      if (fieldMapping[key]) {
        webinarUpdate[fieldMapping[key]] = value;
        const updatedWebinar = { ...webinar, ...webinarUpdate };
        // Update the task in the webinar's task list with new field values
        updatedWebinar.tasks = updatedWebinar.tasks.map(t =>
          t.id === task.id ? { ...t, fieldValues: newValues } : t
        );
        saveWebinar(updatedWebinar);
      }
    }
  };

  const handleSaveFields = () => {
    const updatedTask = { ...task, fieldValues };
    onUpdate(updatedTask);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${priorityBorderClasses[task.priority]} ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleComplete();
              }}
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-gray-300 hover:border-emerald-400'
              }`}
            >
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${phaseBadgeClasses[task.phase]}`}>
                  {phaseLabels[task.phase]}
                </span>
                <span className={`text-xs font-medium ${priorityTextClasses[task.priority]}`}>
                  優先度: {priorityLabels[task.priority]}
                </span>
                <span className="text-xs text-gray-400">約{task.estimatedMinutes}分</span>
              </div>
              <h3 className={`font-medium text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </h3>
              {!expanded && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{task.purpose}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {task.externalUrl && task.externalToolName && !expanded && (
              <a
                href={task.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {task.externalToolName} →
              </a>
            )}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="pt-3 space-y-4">
            {/* Purpose */}
            <div>
              <p className="text-sm text-gray-600">{task.purpose}</p>
            </div>

            {/* Due date */}
            <div className="text-xs text-gray-400">
              期限: {new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
            </div>

            {/* External tool link */}
            {task.externalUrl && task.externalToolName && (
              <a
                href={task.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {task.externalToolName}を開く
              </a>
            )}

            {/* Instructions */}
            {task.instructions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">手順</h4>
                <ol className="space-y-1.5">
                  {task.instructions.map((instruction, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="flex-shrink-0 w-5 h-5 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Required fields */}
            {task.requiredFields.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  入力が必要な情報
                </h4>
                <div className="space-y-2">
                  {task.requiredFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-500 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={fieldValues[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          rows={3}
                          placeholder={`${field.label}を入力...`}
                        />
                      ) : (
                        <input
                          type={field.type === 'url' ? 'url' : 'text'}
                          value={fieldValues[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          placeholder={field.type === 'url' ? 'https://...' : `${field.label}を入力...`}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveFields();
                    }}
                    className="text-sm px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    保存する
                  </button>
                </div>
              </div>
            )}

            {/* Completion criteria */}
            {task.completionCriteria.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">完了基準</h4>
                <ul className="space-y-1">
                  {task.completionCriteria.map((criteria, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {task.warnings.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-amber-700 mb-1.5">⚠️ 注意事項</h4>
                <ul className="space-y-1">
                  {task.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-700">{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Complete button */}
            <button
              onClick={handleComplete}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                task.completed
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {task.completed ? '完了を取り消す' : '完了にする'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
