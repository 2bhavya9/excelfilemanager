/**
 * FileCard.jsx
 * Displays a single staged or uploaded Excel file with metadata and actions.
 *
 * Props:
 *  file        – { name, size, status, progress, uploadedAt?, sheetNames? }
 *  onRemove    – () => void
 *  uploading   – bool  (disables remove while in-flight)
 */
import { formatSize } from '../../utils/fileUtils';

/** Maps status → Tailwind classes for the status badge */
const STATUS_STYLES = {
  staged:    'bg-blue-50 text-blue-600 border border-blue-200',
  uploading: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  done:      'bg-green-50 text-green-600 border border-green-200',
  error:     'bg-red-50 text-red-600 border border-red-200',
};

const STATUS_LABELS = {
  staged:    'Ready',
  uploading: 'Uploading…',
  done:      'Uploaded',
  error:     'Failed',
};

export default function FileCard({ file, onRemove, uploading }) {
  const { name, size, status = 'staged', progress = 0, sheetNames } = file;
  const isUploading = status === 'uploading';

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition-shadow hover:shadow-sm">

      {/* Excel icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xl">
        📊
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800" title={name}>
          {name}
        </p>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
          <span>{formatSize(size)}</span>

          {/* Sheet names preview (populated after xlsx parsing) */}
          {sheetNames?.length > 0 && (
            <span className="truncate max-w-[200px]" title={sheetNames.join(', ')}>
              Sheets: {sheetNames.join(', ')}
            </span>
          )}

          {file.uploadedAt && (
            <span>Uploaded {new Date(file.uploadedAt).toLocaleString()}</span>
          )}
        </div>

        {/* Progress bar — shown while uploading */}
        {isUploading && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Status badge */}
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
        {STATUS_LABELS[status]}
      </span>

      {/* Remove button — hidden while this card is uploading */}
      {!isUploading && (
        <button
          onClick={onRemove}
          disabled={uploading}
          title="Remove"
          className={[
            'shrink-0 flex h-8 w-8 items-center justify-center rounded-lg',
            'text-sm font-bold transition-colors',
            uploading
              ? 'cursor-not-allowed bg-gray-100 text-gray-300'
              : 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600',
          ].join(' ')}
        >
          ✕
        </button>
      )}
    </div>
  );
}
