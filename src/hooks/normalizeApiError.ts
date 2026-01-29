import { toast } from 'sonner';

export type NormalizedError = {
  code: string;
  message: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  '23505': 'Cette ressource existe déjà.',
  '23503': 'Action impossible en raison de dépendances existantes.',
  '42P01': 'Erreur de configuration de la base de données.',
  'PGRST116': 'La ressource demandée est introuvable.',
  'insufficient_quota': 'Quota AI épuisé. Veuillez vérifier votre abonnement.',
  'rate_limit_exceeded': 'Trop de requêtes. Veuillez patienter un instant.',
  'context_length_exceeded': 'Le contenu est trop long pour être traité.',
  'invalid_api_key': 'Erreur de connexion aux services AI.',
  'NETWORK_ERROR': 'Connexion réseau perdue ou instable.',
  'GENERIC_ERROR': 'Une erreur inattendue est survenue.',
};

export const normalizeApiError = (error: any): NormalizedError => {
  let code = 'GENERIC_ERROR';
  let message = ERROR_MESSAGES.GENERIC_ERROR;

  if (error?.code && typeof error.code === 'string') {
    code = error.code;
    message = ERROR_MESSAGES[code] || error.message || message;
  } else if (error?.error?.code) {
    code = error.error.code;
    message = ERROR_MESSAGES[code] || error.error.message || message;
  } else if (error instanceof Error) {
    message = error.message;
    if (error.message.toLowerCase().includes('fetch')) {
      code = 'NETWORK_ERROR';
      message = ERROR_MESSAGES.NETWORK_ERROR;
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  toast.error(message);

  return { code, message };
};
