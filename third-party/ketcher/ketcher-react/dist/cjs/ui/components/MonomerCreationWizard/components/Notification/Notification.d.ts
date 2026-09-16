import type { WizardNotificationId, WizardNotificationType } from '../../MonomerCreationWizard.types';
type Props = {
    id: WizardNotificationId;
    type: WizardNotificationType;
    message: string;
    onDismiss?: (id: WizardNotificationId) => void;
};
declare const Notification: ({ id, type, message, onDismiss }: Props) => import("react").JSX.Element;
export default Notification;
