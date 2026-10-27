import { useState } from 'react';

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import type { User } from '../../types/user';

interface DeleteDialogProps {
  /** Whether the dialog should be mounted at all. */
  open: boolean;
  user: User | null;
  onClose: () => void;
  /**
   * Parent-provided DELETE routine. Rejections keep the dialog open with the
   * error visible; a resolved promise means the record was removed.
   */
  onConfirm: () => Promise<void>;
}

export default function DeleteDialog({ open, user, onClose, onConfirm }: DeleteDialogProps) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The dialog must only exist while it is actually open — an always-mounted
  // empty modal would cover the page and swallow every click.
  if (!open || !user) return null;

  async function handleConfirm() {
    if (!user) return;
    setWorking(true);
    setError(null);
    try {
      await onConfirm();
      // Parent closes the dialog on success.
    } catch (err) {
      setError((err as Error).message ?? 'Could not delete this user');
      setWorking(false);
    }
  }

  return (
    <Modal
      title="Delete user"
      onClose={onClose}
      width={420}
      footer={
        <>
          {/* PRD: with confirmation dialogs focus lands on the safe action.
              autoFocus on Cancel prevents Enter from deleting instantly. */}
          <Button variant="secondary" autoFocus data-autofocus onClick={onClose} disabled={working}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={working}>
            {working ? <Spinner size={14} label="Deleting" /> : null}
            {working ? 'Deleting…' : 'Delete user'}
          </Button>
        </>
      }
    >
      {user ? (
        <div className="delete-dialog">
          {error ? <p className="form-banner">{error}</p> : null}
          <p>
            You're about to permanently remove{' '}
            <strong>{user.name}</strong> ({user.email}).
          </p>
          <p className="muted">This action cannot be undone.</p>
        </div>
      ) : null}
    </Modal>
  );
}
